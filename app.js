  require("dotenv").config();
  
const express = require("express");
const ejsMate = require("ejs-mate");
const path = require("node:path");
const fs = require("node:fs");
const projectStore = require("./models/project");

const auth = require("./admin-auth");
const projectImages = require("./project-images");
const app = express();
app.disable("x-powered-by");

// Views are HTML templates; public contains CSS, JavaScript and images.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: false, limit: "9mb", parameterLimit: 20}));
app.use(auth.middleware);
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isAdminPage = req.path.startsWith("/admin") || req.path === "/projects/new" || (req.method === "POST" && req.path === "/projects");
  next();
});
app.locals.isHome = false;
app.locals.hasAsset = (file) =>
  fs.existsSync(path.join(__dirname, "public", file));

app.get("/", (req, res) => {
  res.render("listings/index", {
    title: "Portfolio",
    isHome: true,
    projects: projectStore.all(),
  });
});

app.get('/admin/login', (req,res) => {
  res.set('Cache-Control','no-store');
  if(req.adminSession?.admin) return res.redirect('/admin/projects');
  if(!req.adminSession) auth.create(req,res,false);
  res.render('admin/login',{title:'Admin login',error:''});
});
app.post('/admin/login', auth.csrf, auth.login);
app.post('/admin/logout', auth.required, auth.csrf, auth.logout);
app.get('/admin', auth.required, (req,res)=>res.redirect('/admin/projects'));
app.get('/admin/projects', auth.required, (req,res)=>res.render('admin/projects',{title:'Manage projects',projects:projectStore.all()}));
app.get('/projects/new', auth.required, (req,res)=>res.render('listings/new',{title:'Add project',error:'',values:{},action:'/projects'}));
app.post('/projects', auth.required, auth.csrf, (req,res)=>{
  const project = projectStore.clean(req.body);
  const error = projectStore.validate(project) || projectImages.error(req.body.imageData);
  if(error) return res.status(400).render('listings/new',{title:'Add project',error,values:project,action:'/projects'});
  project.image = projectImages.store(req.body.imageData);
  try { projectStore.add(project); } catch(error) { projectImages.remove(project.image); throw error; }
  res.redirect(303,'/admin/projects');
});
app.get('/admin/projects/:id/edit', auth.required, (req,res)=>{
  const project = projectStore.all().find(p=>p.id === req.params.id);
  if(!project) return res.status(404).send('Project not found.');
  res.render('listings/new',{title:'Edit project',error:'',values:project,action:'/admin/projects/'+project.id+'/edit'});
});
app.post('/admin/projects/:id/edit', auth.required, auth.csrf, (req,res)=>{
  const project = projectStore.clean(req.body);
  const existing = projectStore.all().find(p=>p.id === req.params.id);
  if(!existing) return res.status(404).send('Project not found.');
  const error = projectStore.validate(project) || projectImages.error(req.body.imageData);
  if(error) return res.status(400).render('listings/new',{title:'Edit project',error,values:{...existing,...project},action:'/admin/projects/'+req.params.id+'/edit'});
  project.image = req.body.imageData ? projectImages.store(req.body.imageData) : req.body.removeImage === 'on' ? '' : (existing.image || '');
  try { projectStore.update(req.params.id,project); } catch(error) { if(project.image !== existing.image) projectImages.remove(project.image); throw error; }
  if(project.image !== existing.image) projectImages.remove(existing.image);
  res.redirect(303,'/admin/projects');
});
app.post('/admin/projects/:id/delete', auth.required, auth.csrf, (req,res)=>{
  const existing = projectStore.all().find(p=>p.id === req.params.id);
  if(!projectStore.remove(req.params.id)) return res.status(404).send('Project not found.');
  projectImages.remove(existing?.image);
  res.redirect(303,'/admin/projects');
});

app.get("/assets-help", (req, res) =>
  res.render("listings/assets-help", {title: "Missing attachment"}),
);
app.use((req, res) => res.status(404).send("Page not found. Go back to /."));
app.use((error, req, res, next) => {
  console.error(error.message);
  res
    .status(error.status || 500)
    .send("Unable to complete the request. Check your terminal.");
});

// Listen on the LAN so phones on the same Wi-Fi can view the portfolio.
const port = process.env.PORT || 8080;
app.listen(port, process.env.HOST || "0.0.0.0", () =>
  console.log(`Open http://localhost:${port}`),
);
