const request=require("supertest")
const jwt=require("jsonwebtoken")
const mongoose=require("mongoose")
const app= require("../src/app")
const User=require("../src/models/user")
const {userOneId, userOne, setupDatabase}= require("./fixtures/db")

beforeEach(setupDatabase)

test("Should signup a new user",async ()=>{
    const response= await request(app).post("/users").send({
        name: "Anas",
        email: "Anassennin@gmail.com",
        password: "Mypass123456"
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertion about the response
    expect(response.body).toMatchObject({
        user:{
            name: "Anas",
            email: "anassennin@gmail.com"
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe("anas123456")


})

test("Should login existing user", async()=>{
    const response=await request(app).post("/users/login").send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    //Checking if the user has a second token
    expect(user.tokens[1].token).not.toBeNull()
})

test("Should not login with nonexistant user",async()=>{
    await request(app).post("/users/login").send({
        email: "test",
        password: userOne.password
    }).expect(400)
})

test("Should get profile for user", async ()=>{
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not get profile for unauthenticated user", async()=>{
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})

test("Should delete account for user", async ()=>{
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user= await User.findById(userOneId)
    expect(user).toBeNull()
})

test("Should not delete account for unauthenticated user", async()=>{
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)

})

test("Should upload avatar image", async ()=>{
    await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar","tests/fixtures/profile-pic.jpg")
    .expect(200)

    const user= await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test("Should update valid user fields",async ()=>{
    await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: "new"
    })
    .expect(200)

    const user= await User.findById(userOneId)
    expect(user.name).toBe("new")
})

test("Should not update invalid user fields", async ()=>{
    await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: "new"
    })
    .expect(400)
})