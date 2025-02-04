import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { mockCreateBlogBody, mockUpdateBlogBody } from './mock/mock-data';

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
    const response = await blogsTestManager.createBlog(mockCreateBlogBody);

    expect(response).toEqual({
      name: mockCreateBlogBody.name,
      description: mockCreateBlogBody.description,
      websiteUrl: mockCreateBlogBody.websiteUrl,
      isMembership: false,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it("shouldn't create blog with invalid auth", async () => {
    const response = await blogsTestManager.createBlogWithInvalidAuth(mockCreateBlogBody);

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
    const blog = await blogsTestManager.createBlog(mockCreateBlogBody);
    const getBlogsResponse = await blogsTestManager.getBlogs();
    expect(getBlogsResponse.items).toHaveLength(1);
    await blogsTestManager.deleteBlog(blog.id);
    const getBlogsResponseAfterDelete = await blogsTestManager.getBlogs();
    expect(getBlogsResponseAfterDelete.items).toHaveLength(0);
    expect(getBlogsResponseAfterDelete.totalCount).toBe(0);
    expect(getBlogsResponseAfterDelete.pagesCount).toBe(0);
  });

  it('should update blog', async () => {
    const blog = await blogsTestManager.createBlog(mockCreateBlogBody);
    const getBlogsResponse = await blogsTestManager.getBlogs();
    expect(getBlogsResponse.items).toHaveLength(1);
    await blogsTestManager.updateBlog(blog.id, mockUpdateBlogBody);
    const getBlogsResponseAfterUpdate = await blogsTestManager.getBlogs();
    expect(getBlogsResponseAfterUpdate.items[0].name).toBe(mockUpdateBlogBody.name);
    expect(getBlogsResponseAfterUpdate.items[0].description).toBe(mockUpdateBlogBody.description);
    expect(getBlogsResponseAfterUpdate.items[0].websiteUrl).toBe(mockUpdateBlogBody.websiteUrl);
  });

  it("shouldn't delete blog with invalid auth", async () => {
    const blog = await blogsTestManager.createBlog(mockCreateBlogBody);

    await blogsTestManager.deleteBlogWithInvalidAuth(blog.id);
  });

  it('should GET blogs, POST blog and GET blogs again', async () => {
    const blogs = await blogsTestManager.createSeveralBlogs(5);
    const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');

    expect(blogs.length).toBe(5);
    expect(getBlogsResponse.totalCount).toBe(5);

    await blogsTestManager.createBlog(mockCreateBlogBody);

    const getBlogsResponseAgain = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');
    expect(getBlogsResponseAgain.totalCount).toBe(6);
  });
});
