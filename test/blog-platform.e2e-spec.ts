import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { BlogCreateDto } from 'src/features/bloggers-platform/blogs/dto/blog-create.dto';
import { PostsTestManager } from './helpers/posts-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { LikeStatus } from 'src/features/bloggers-platform/likes/dto/like-status.dto';

describe('Bloggers platform - blogs, posts, comments  Posts  Posts likes  ', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let postsTestManager: PostsTestManager;
  let userTestManger: UsersTestManager;

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
    blogsTestManager = result.blogsTestManager;
    postsTestManager = result.postsTestManager;
    userTestManger = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it(`GET -> "/blogs/:blogId/posts": create 6 posts then:
  like post 1 by user 1, user 2; 
  like post 2 by user 2, user 3; 
  dislike post 3 by user 1;
  like post 4 by user 1, user 4, user 2, user 3;
  like post 5 by user 2, dislike by user 3;
  like post 6 by user 1, dislike by user 2.
  Get the posts by user 1 after all likes
  NewestLikes should be sorted in descending; status 200; content: posts array with pagination;`, async () => {
    const blogBody: BlogCreateDto = {
      name: 'name1',
      description: 'qwerty',
      websiteUrl: 'email@email.em',
    };

    const blog = await blogsTestManager.createBlog(blogBody);
    const posts = await postsTestManager.createSeveralPosts(6, blog.id);

    const [post1, post2, post3, post4, post5, post6] = posts;

    const getPostsResponse = await postsTestManager.getPosts(blog.id);

    expect(posts.length).toBe(6);
    expect(getPostsResponse.totalCount).toBe(6);

    const users = await userTestManger.createSeveralUsers(4);
    const getUsersResponse = await userTestManger.getUsers('?pageNumber=2&sortDirection=asc');

    expect(users.length).toBe(4);
    expect(getUsersResponse.totalCount).toBe(4);

    const tokenUser1 = await userTestManger.login(users[0].login, '123456789');
    const tokenUser2 = await userTestManger.login(users[1].login, '123456789');
    const tokenUser3 = await userTestManger.login(users[2].login, '123456789');
    const tokenUser4 = await userTestManger.login(users[3].login, '123456789');

    //* like post 1 by user 1, user 2;
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post1.id, tokenUser1.accessToken); //post 1 - user1 like, user2 like // 2 likes 0 dislikes
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post1.id, tokenUser2.accessToken);

    //* like post 2 by user 2, user 3;
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post2.id, tokenUser2.accessToken); //post 2 - user2 like, user3 like // 2 likes 0 dislikes
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post2.id, tokenUser3.accessToken);

    //* dislike post 3 by user 1;
    await postsTestManager.likePost({ likeStatus: LikeStatus.Dislike }, post3.id, tokenUser1.accessToken); //post 3 - user1 dislike // 0 likes 1 dislikes

    //* like post 4 by user 1, user 4, user 2, user 3;
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post4.id, tokenUser1.accessToken); //post 4 - user1 like user2 like user3 like user4 like // 4 likes 0 dislikes
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post4.id, tokenUser2.accessToken);
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post4.id, tokenUser3.accessToken);
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post4.id, tokenUser4.accessToken);

    //* like post 5 by user 2, dislike by user 3;
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post5.id, tokenUser2.accessToken); //post 5 - user2 like user3 dislike  // 1 likes 1 dislikes
    await postsTestManager.likePost({ likeStatus: LikeStatus.Dislike }, post5.id, tokenUser3.accessToken);

    //* like post 6 by user 1, dislike by user 2.
    await postsTestManager.likePost({ likeStatus: LikeStatus.Like }, post6.id, tokenUser1.accessToken); //post 6 - user1 like user2 dislike // 1 likes 1 dislikes
    await postsTestManager.likePost({ likeStatus: LikeStatus.Dislike }, post6.id, tokenUser2.accessToken);

    //* Get the posts by user 1 after all likes
    const getPostsResponse2 = await postsTestManager.getPostsWithAuth(blog.id, tokenUser1.accessToken);

    expect(getPostsResponse2.totalCount).toBe(6);
    expect(getPostsResponse2.items.length).toBe(6);

    const [updatedPost1, updatedPost2, updatedPost3, updatedPost4, updatedPost5, updatedPost6] = getPostsResponse2.items.reverse();

    // updatedPost1
    expect(updatedPost1.title).toBe('post0');
    expect(updatedPost1.extendedLikesInfo.likesCount).toBe(2);
    expect(updatedPost1.extendedLikesInfo.dislikesCount).toBe(0);
    expect(updatedPost1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    // updatedPost2
    expect(updatedPost2.title).toBe('post1');
    expect(updatedPost1.extendedLikesInfo.likesCount).toBe(2);
    expect(updatedPost1.extendedLikesInfo.dislikesCount).toBe(0);
    expect(updatedPost1.extendedLikesInfo.myStatus).toBe(LikeStatus.None);

    // updatedPost3
    expect(updatedPost3.title).toBe('post2');
    expect(updatedPost1.extendedLikesInfo.likesCount).toBe(0);
    expect(updatedPost1.extendedLikesInfo.dislikesCount).toBe(1);
    expect(updatedPost1.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);

    // updatedPost4
    expect(updatedPost4.title).toBe('post3');
    expect(updatedPost1.extendedLikesInfo.likesCount).toBe(4);
    expect(updatedPost1.extendedLikesInfo.dislikesCount).toBe(0);
    expect(updatedPost1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    // updatedPost5
    expect(updatedPost5.title).toBe('post4');
    expect(updatedPost1.extendedLikesInfo.likesCount).toBe(1);
    expect(updatedPost1.extendedLikesInfo.dislikesCount).toBe(1);
    expect(updatedPost1.extendedLikesInfo.myStatus).toBe(LikeStatus.None);

    // updatedPost6
    expect(updatedPost6.title).toBe('post5');
    expect(updatedPost1.extendedLikesInfo.likesCount).toBe(1);
    expect(updatedPost1.extendedLikesInfo.dislikesCount).toBe(1);
    expect(updatedPost1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
  });
});
