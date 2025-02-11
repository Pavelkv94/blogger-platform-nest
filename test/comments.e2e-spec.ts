import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { PostsTestManager } from './helpers/posts-test-manager';
import { mockCreateBlogBody, mockCreateCommentBody, mockCreatePostBody, mockCreateUserBody, mockUpdateCommentBody } from './mock/mock-data';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { CommentsTestManager } from './helpers/comments-test-manager';
import { PostViewDto } from 'src/features/bloggers-platform/posts/dto/post-view.dto';
import { UsersTestManager } from './helpers/users-test-manager';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';

describe('comments', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let commentsTestManager: CommentsTestManager;
  let usersTestManager: UsersTestManager;
  let post: PostViewDto;
  let token: string;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'secret_key',
          signOptions: { expiresIn: '10s' },
        }),
      ),
    );
    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    commentsTestManager = result.commentsTestManager;
    usersTestManager = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    const blogRespone = await blogsTestManager.createBlog(mockCreateBlogBody);
    const postResponse = await postsTestManager.createPost(mockCreatePostBody, blogRespone.id);
    post = postResponse;
    const userResponse = await usersTestManager.createUser(mockCreateUserBody);
    const { accessToken } = await usersTestManager.login(userResponse.login, mockCreateUserBody.password);
    token = accessToken;
  });

  it('should create comment', async () => {
    const commentResponse = await commentsTestManager.createComment(mockCreateCommentBody, post.id, token);
    expect(commentResponse).toEqual({
      content: mockCreateCommentBody.content,
      id: expect.any(String),
      createdAt: expect.any(String),
      //     extendedLikesInfo: expect.any(Object),
    });
  });

  it('should get comment', async () => {
    const commentResponse = await commentsTestManager.createComment(mockCreateCommentBody, post.id, token);
    const getCommentResponse = await commentsTestManager.getComment(commentResponse.id);
    expect(getCommentResponse).toEqual(commentResponse);
  });

  it('should get post comments with paging', async () => {
    const comments = await commentsTestManager.createSeveralComments(12, post.id, token);
    const getCommentsResponse = await commentsTestManager.getPostComments('?pageNumber=2&sortDirection=asc', post.id);
    expect(comments.length).toBe(12);
    expect(getCommentsResponse.totalCount).toBe(12);
    expect(getCommentsResponse.items).toHaveLength(2);
    expect(getCommentsResponse.pagesCount).toBe(2);
  });

  it('should update comment', async () => {
    const comment = await commentsTestManager.createComment(mockCreateCommentBody, post.id, token);
    const getCommentsResponse = await commentsTestManager.getPostComments('', post.id);
    expect(getCommentsResponse.items.length).toBe(1);

    await commentsTestManager.updateComment(comment.id, mockUpdateCommentBody, token);
    const getCommentsResponseAfterUpdate = await commentsTestManager.getPostComments('', post.id);

    expect(getCommentsResponseAfterUpdate.items[0].content).toBe(mockUpdateCommentBody.content);
    expect(getCommentsResponseAfterUpdate.items[0].id).toBe(comment.id);
    expect(getCommentsResponseAfterUpdate.items[0].createdAt).toBe(comment.createdAt);
  });

  it('should delete comment', async () => {
    const comment = await commentsTestManager.createComment(mockCreateCommentBody, post.id, token);
    const getCommentsResponse = await commentsTestManager.getPostComments('', post.id);
    expect(getCommentsResponse.items.length).toBe(1);

    await commentsTestManager.deleteComment(comment.id, token);
    const getCommentsResponseAfterDelete = await commentsTestManager.getPostComments('', post.id);
    expect(getCommentsResponseAfterDelete.items.length).toBe(0);
  });

  it('should like comment', async () => {
    const comment = await commentsTestManager.createComment(mockCreateCommentBody, post.id, token);
    await commentsTestManager.likeComment({ likeStatus: LikeStatus.Like }, comment.id, token);

    const getCommentResponse = await commentsTestManager.getComment(comment.id);
    expect(getCommentResponse.likesInfo.likesCount).toBe(1);
    expect(getCommentResponse.likesInfo.myStatus).toBe(LikeStatus.None);

    const getCommentAuthResponse = await commentsTestManager.getCommentWithAuth(comment.id, token);
    expect(getCommentAuthResponse.likesInfo.likesCount).toBe(1);
    expect(getCommentAuthResponse.likesInfo.myStatus).toBe(LikeStatus.Like);
  });

  it('should dislike comment', async () => {
    const comment = await commentsTestManager.createComment(mockCreateCommentBody, post.id, token);
    await commentsTestManager.likeComment({ likeStatus: LikeStatus.Dislike }, comment.id, token);

    const getCommentResponse = await commentsTestManager.getComment(comment.id);
    expect(getCommentResponse.likesInfo.likesCount).toBe(0);
    expect(getCommentResponse.likesInfo.myStatus).toBe(LikeStatus.None);

    const getCommentAuthResponse = await commentsTestManager.getCommentWithAuth(comment.id, token);
    expect(getCommentAuthResponse.likesInfo.likesCount).toBe(0);
    expect(getCommentAuthResponse.likesInfo.myStatus).toBe(LikeStatus.Dislike);
  }); 
});
