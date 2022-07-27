const request= require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app=require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();
const userone = {
    name:"Anshul gupta",
    email:"ansh.org@gmail.com",
    password:"Aman@1234",
    _id:userOneId,
    tokens:[{
        token:jwt.sign({_id:userOneId},process.env.secretcode)
    }]
}

beforeEach(async ()=>{
    await User.deleteMany();
    await new User(userone).save();
});

test('signup test',async ()=>{
    const response = await request(app).post('/users').send({
        name:"Anshul",
        email:'anshulgupta.org@gmail.com',
        password:'Aman@1234'
    }).expect(201);

    // Assert that the database was changed correctly

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertion about the response


});

test('should login existing user', async ()=>{
    const response=await request(app).post('/users/login').send({
        email:userone.email,
        password:userone.password
    }).expect(200);

    const user = await User.findById(response.body.user._id);

    expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login in', async () =>{
    await request(app).post('/users/login').send({
        email:'anshdulgupta.org@gmail.com',
        password:userone.password
    }).expect(500);
});

test('should get profile for user', async ()=>{
    await request(app).get('/users/me')
        .set('Authorization',`Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(200);
});

test('should not get profile for user', async ()=>{
    await request(app).get('/users/me')
        .send()
        .expect(401);
});

test('should delete profile for user', async ()=>{
    await request(app).delete('/users/me')
        .set('Authorization',`Bearer ${userone.tokens[0].token}`)
        .send()
        .expect(200);

        const user=await User.findById(userOneId);

        expect(user).toBeNull();
});

test('should not delete profile for user', async ()=>{
    await request(app).delete('/users/me')
        .send()
        .expect(401);
});