const request= require("supertest")
const Task= require("../src/models/task")
const app= require("../src/app")
const {userOneId, userOne, userTwoId, userTwo, taskOne, taskTwo, taskThree, setupDatabase}= require("./fixtures/db")

beforeEach(setupDatabase)

test("Should create task for user", async()=>{
    const response= await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        description:"From my test"
    })
    .expect(201)

    const task=await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test("Should get all tasks for user One", async()=>{
    const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
})

test("Should test the delete task security", async()=>{
    const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task= Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})