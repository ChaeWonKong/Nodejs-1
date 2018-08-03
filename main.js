const express = require('express');
const fs = require('fs');
const app = express();
const template = require('./lib/template.js');
const path = require('path');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

// Default Page
app.get('/', function(req, res) {
  fs.readdir('./data', function(error, filelist){
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    res.send(html);
  });
});

// Page View
app.get('/page/:pageId', function(req, res) {
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags:['h1']
      });
      var list = template.list(filelist);
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update/${sanitizedTitle}">update</a>
          <form action="/delete" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      res.send(html);
    });
  });
})

// Create Page
app.get('/create', function(req, res) {
  fs.readdir('./data', function(error, filelist){
    var title = 'WEB - create';
    var list = template.list(filelist);
    var html = template.HTML(title, list, `
      <form action="/create" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    res.send(html);
  });
})

// Create Process
app.post('/create', function(req, res) {
  let body = '';
  req.on('data', function(data){
    body = body + data;
  });
  req.on('end', function(){
    const post = qs.parse(body);
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      res.redirect(302, `/page/${title}`);
    })
  });
})

// Update Page
app.get('/update/:pageId', function(req, res) {
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(req.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = req.params.pageId;
      var list = template.list(filelist);
      var html = template.HTML(title, list,
        `
        <form action="/update" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      res.send(html);
    });
  });
})

// Update Process
app.post('/update', function(req, res) {
  let body = '';
  req.on('data', function(data){
      body = body + data;
  });
  req.on('end', function(){
    const post = qs.parse(body);
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        res.redirect(302, `/page/${title}`);
      })
    });
  });
})

// Delete Process
app.post('/delete', function(req, res) {
  let body = '';
  req.on('data', function(data){
  body = body + data;
  });
  req.on('end', function(){
    const post = qs.parse(body);
    const id = post.id;
    const filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      res.redirect(302, '/');
    })
  });
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))