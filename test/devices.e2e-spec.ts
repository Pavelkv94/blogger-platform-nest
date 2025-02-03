import { INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { DevicesTestManager } from './helpers/devices-test-manager';
import { CreateUserDto } from 'src/features/user-accounts/dto/users/create-user.dto';
import { UsersTestManager } from './helpers/users-test-manager';

describe('devices', () => {
  let app: INestApplication;
  let devicesTestManager: DevicesTestManager;
  let userTestManger: UsersTestManager;

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
    devicesTestManager = result.devicesTestManager;
    userTestManger = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  const userData: CreateUserDto = {
    login: 'name1',
    password: 'qwerty',
    email: 'email@email.em',
  };

  it('should add device after login', async () => {
    await userTestManger.createUser(userData);

    const loginResponse = await userTestManger.loginWithAgent(userData.login, userData.password, 'winda');
    const cookies = loginResponse.headers['set-cookie'];
    console.log("cookies", cookies);
    expect(cookies).toBeDefined();

    const refreshToken = cookies[0].split(' ')[0].split('=')[1];

    const getDevicesResponse = await devicesTestManager.getDevicesWithAuth(refreshToken);

    expect(getDevicesResponse.length).toBe(1);
    // const response = await devicesTestManager.(body);

    // expect(response).toEqual({
    //   name: body.name,
    //   description: body.description,
    //   websiteUrl: body.websiteUrl,
    //   isMembership: false,
    //   id: expect.any(String),
    //   createdAt: expect.any(String),
    // });
  });

  // it("shouldn't create blog with invalid auth", async () => {
  //   const body: BlogCreateDto = {
  //     name: 'name1',
  //     description: 'qwerty',
  //     websiteUrl: 'email@email.em',
  //   };

  //   const response = await blogsTestManager.createBlogWithInvalidAuth(body);

  //   expect(response.message).toEqual('Unauthorized');
  // });

  // it('should get blogs with paging', async () => {
  //   const blogs = await blogsTestManager.createSeveralBlogs(12);
  //   const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=2&sortDirection=asc');

  //   expect(blogs.length).toBe(12);
  //   expect(getBlogsResponse.totalCount).toBe(12);
  //   expect(getBlogsResponse.items).toHaveLength(2);
  //   expect(getBlogsResponse.pagesCount).toBe(2);
  // });

  // it('should delete blog', async () => {
  //   const blog = await blogsTestManager.createBlog({
  //     name: 'name1',
  //     description: 'qwerty',
  //     websiteUrl: 'example.com',
  //   });

  //   await blogsTestManager.deleteBlog(blog.id);

  //   const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');

  //   expect(getBlogsResponse.items).toHaveLength(0);
  //   expect(getBlogsResponse.totalCount).toBe(0);
  //   expect(getBlogsResponse.pagesCount).toBe(0);
  // });

  // it("shouldn't delete blog with invalid auth", async () => {
  //   const blog = await blogsTestManager.createBlog({
  //     name: 'name1',
  //     description: 'qwerty',
  //     websiteUrl: 'example.com',
  //   });

  //   await blogsTestManager.deleteBlogWithInvalidAuth(blog.id);
  // });

  // it('should GET blogs, POST blog and GET blogs again', async () => {
  //   const blogs = await blogsTestManager.createSeveralBlogs(5);
  //   const getBlogsResponse = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');

  //   expect(blogs.length).toBe(5);
  //   expect(getBlogsResponse.totalCount).toBe(5);

  //   const body: BlogCreateDto = {
  //     name: 'name1',
  //     description: 'qwerty',
  //     websiteUrl: 'email@email.em',
  //   };

  //   await blogsTestManager.createBlog(body);

  //   const getBlogsResponseAgain = await blogsTestManager.getBlogs('?pageNumber=1&sortDirection=asc');
  //   expect(getBlogsResponseAgain.totalCount).toBe(6);
  // });
});
