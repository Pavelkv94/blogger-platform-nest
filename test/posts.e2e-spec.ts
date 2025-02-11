import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { PostsTestManager } from './helpers/posts-test-manager';
import { mockCreateBlogBody, mockCreatePostBody, mockCreateUserBody, mockUpdatePostBody } from './mock/mock-data';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { BlogViewDto } from 'src/features/bloggers-platform/blogs/dto/blog-view.dto';
import { UsersTestManager } from './helpers/users-test-manager';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';

describe('posts', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let usersTestManager: UsersTestManager;
  let blog: BlogViewDto;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'secret_key',
          signOptions: { expiresIn: '2s' },
        }),
      ),
    );
    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    usersTestManager = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
    const blogRespone = await blogsTestManager.createBlog(mockCreateBlogBody);
    blog = blogRespone;
  });

  it('should create post', async () => {
    const response = await postsTestManager.createPost(mockCreatePostBody, blog.id);

    expect(response).toEqual({
      title: mockCreatePostBody.title,
      shortDescription: mockCreatePostBody.shortDescription,
      content: mockCreatePostBody.content,
      blogId: blog.id,
      id: expect.any(String),
      createdAt: expect.any(String),
      blogName: blog.name,
      extendedLikesInfo: expect.any(Object),
    });
  });

  it('should get posts with paging', async () => {
    const posts = await postsTestManager.createSeveralPosts(12, blog.id);
    const getPostsResponse = await postsTestManager.getPosts(blog.id, '?pageNumber=2&sortDirection=asc');

    expect(posts.length).toBe(12);
    expect(getPostsResponse.totalCount).toBe(12);
    expect(getPostsResponse.items).toHaveLength(2);
    expect(getPostsResponse.pagesCount).toBe(2);
  });

  it('should delete blog', async () => {
    const post = await postsTestManager.createPost(mockCreatePostBody, blog.id);
    const getPostsResponse = await postsTestManager.getPosts(blog.id, '');
    expect(getPostsResponse.items).toHaveLength(1);
    await postsTestManager.deletePost(post.id, blog.id);
    const getPostsResponseAfterDelete = await postsTestManager.getPosts(blog.id, '');
    expect(getPostsResponseAfterDelete.items).toHaveLength(0);
    expect(getPostsResponseAfterDelete.totalCount).toBe(0);
    expect(getPostsResponseAfterDelete.pagesCount).toBe(0);
  });

  it('should update blog', async () => {
    const post = await postsTestManager.createPost(mockCreatePostBody, blog.id);
    const getPostsResponse = await postsTestManager.getPosts(blog.id, '');
    expect(getPostsResponse.items).toHaveLength(1);
    await postsTestManager.updatePost(post.id, mockUpdatePostBody, blog.id);
    const getPostsResponseAfterUpdate = await postsTestManager.getPosts(blog.id, '');
    expect(getPostsResponseAfterUpdate.items[0].title).toBe(mockUpdatePostBody.title);
    expect(getPostsResponseAfterUpdate.items[0].shortDescription).toBe(mockUpdatePostBody.shortDescription);
    expect(getPostsResponseAfterUpdate.items[0].content).toBe(mockUpdatePostBody.content);
  });

  it('should GET blogs, POST blog and GET blogs again', async () => {
    const posts = await postsTestManager.createSeveralPosts(5, blog.id);
    const getPostsResponse = await postsTestManager.getPosts(blog.id, '?pageNumber=1&sortDirection=asc');

    expect(posts.length).toBe(5);
    expect(getPostsResponse.totalCount).toBe(5);

    await postsTestManager.createPost(mockCreatePostBody, blog.id);

    const getPostsResponseAgain = await postsTestManager.getPosts(blog.id, '?pageNumber=1&sortDirection=asc');
    expect(getPostsResponseAgain.totalCount).toBe(6);
  });

  it('should like post', async () => {
    const post = await postsTestManager.createPost(mockCreatePostBody, blog.id);

    await usersTestManager.createUser(mockCreateUserBody);
    const { accessToken } = await usersTestManager.login(mockCreateUserBody.login, mockCreateUserBody.password);

    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post.id, accessToken);

    const getPostResponse = await postsTestManager.getPost(post.id);

    expect(getPostResponse.extendedLikesInfo.likesCount).toBe(1);
    expect(getPostResponse.extendedLikesInfo.myStatus).toBe(LikeStatus.None);

    const getAuthPostResponse = await postsTestManager.getPostWithAuth(post.id, accessToken);
    expect(getAuthPostResponse.extendedLikesInfo.likesCount).toBe(1);
    expect(getAuthPostResponse.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
  });

  it('should dislike post', async () => {
    const post = await postsTestManager.createPost(mockCreatePostBody, blog.id);

    await usersTestManager.createUser(mockCreateUserBody);
    const { accessToken } = await usersTestManager.login(mockCreateUserBody.login, mockCreateUserBody.password);

    await postsTestManager.likePost({ likeStatus: LikeStatus.Dislike }, post.id, accessToken);

    const getPostResponse = await postsTestManager.getPost(post.id);

    expect(getPostResponse.extendedLikesInfo.likesCount).toBe(0);
    expect(getPostResponse.extendedLikesInfo.myStatus).toBe(LikeStatus.None);

    const getAuthPostResponse = await postsTestManager.getPostWithAuth(post.id, accessToken);
    expect(getAuthPostResponse.extendedLikesInfo.likesCount).toBe(0);
    expect(getAuthPostResponse.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);
  });
});
