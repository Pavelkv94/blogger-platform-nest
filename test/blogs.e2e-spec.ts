import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { BlogCreateDto } from 'src/features/bloggers-platform/blogs/dto/blog-create.dto';

describe('blogs', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;

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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create blog', async () => {
    const body: BlogCreateDto = {
      name: 'name1',
      description: 'qwerty',
      websiteUrl: 'email@email.em',
    };

    const response = await blogsTestManager.createBlog(body);

    expect(response).toEqual({
      name: body.name,
      description: body.description,
      websiteUrl: body.websiteUrl,
      isMembership: false,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it("shouldn't create blog with invalid auth", async () => {
    const body: BlogCreateDto = {
      name: 'name1',
      description: 'qwerty',
      websiteUrl: 'email@email.em',
    };

    const response = await blogsTestManager.createBlogWithInvalidAuth(body);

    expect(response.message).toEqual('Unauthorized');
  });

  it('should get blogs with paging', async () => {
    const blogs = await blogsTestManager.createSeveralBlogs(12);
    const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=2&sortDirection=asc');

    expect(blogs.length).toBe(12);
    expect(getBlogsResponse.totalCount).toBe(12);
    expect(getBlogsResponse.items).toHaveLength(2);
    expect(getBlogsResponse.pagesCount).toBe(2);
  });

  it('should delete blog', async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name1',
      description: 'qwerty',
      websiteUrl: 'example.com',
    });

    await blogsTestManager.deleteBlog(blog.id);

    const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');

    expect(getBlogsResponse.items).toHaveLength(0);
    expect(getBlogsResponse.totalCount).toBe(0);
    expect(getBlogsResponse.pagesCount).toBe(0);
  });

  it("shouldn't delete blog with invalid auth", async () => {
    const blog = await blogsTestManager.createBlog({
      name: 'name1',
      description: 'qwerty',
      websiteUrl: 'example.com',
    });

    await blogsTestManager.deleteBlogWithInvalidAuth(blog.id);
  });

  it('should GET blogs, POST blog and GET blogs again', async () => {
    const blogs = await blogsTestManager.createSeveralBlogs(5);
    const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');

    expect(blogs.length).toBe(5);
    expect(getBlogsResponse.totalCount).toBe(5);

    const body: BlogCreateDto = {
      name: 'name1',
      description: 'qwerty',
      websiteUrl: 'email@email.em',
    };

    await blogsTestManager.createBlog(body);

    const getBlogsResponseAgain = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');
    expect(getBlogsResponseAgain.totalCount).toBe(6);
  });
});
