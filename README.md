# 👥 Employee Directory App

A simple and interactive **Employee Directory App** created as part of the **LA Tech Rising Internship Program**.

The project gives interns hands-on experience working together on a real software project using HTML, CSS, JavaScript, GitHub, Jira, and Slack.

## 🌐 Live Website

👉 https://siromidahmadi.github.io/employee-directory-app/

## 📌 About the Project

The Employee Directory App allows users to view team members, search for employees, and see basic employee information in a clean and responsive layout.

Throughout the project, interns contribute new features, improve the design, fix issues, and practice working with GitHub branches and pull requests.

## ✨ Features

- 👤 Employee profile cards
- 🔎 Employee search
- 🏢 Department information
- 🏷️ Employee badges
- 📸 Profile photos
- 📱 Responsive design
- 🎨 Modern UI styling
- ✨ Simple micro-interactions

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript
- Git & GitHub
- GitHub Pages
- Visual Studio Code
- Live Server
- Jira
- Slack

## 🚀 How to Run the Project

1. Clone the repository:

   `git clone https://github.com/siromidahmadi/employee-directory-app.git`

2. Open the project folder in **Visual Studio Code**.

3. Open `index.html`.

4. Right-click the file and select **Open with Live Server**.

You can also open `index.html` directly in your browser.

## 🌿 GitHub Workflow

For new changes, create a separate branch instead of editing the main branch directly.

Example:

`git checkout -b feature-name`

After completing your work:

`git add .`

`git commit -m "Describe your changes"`

`git push origin feature-name`

Then create a **Pull Request** on GitHub.

After the Pull Request is reviewed and approved, it can be merged into the main branch.

## 👨‍💻 Internship Team

This project is developed collaboratively by interns participating in the **LA Tech Rising Internship Program**.

Team members work on different areas such as:

- UI design
- Employee cards
- Search functionality
- Profile photos
- Employee badges
- Responsive design
- Testing and bug fixes
- Documentation

## 📅 Project Structure

The project is developed over multiple weeks.

Each week introduces new tasks and improvements while giving interns experience with:

**Planning → Jira Tasks → Coding → Git Branches → Pull Requests → Code Review → Merge → Deployment**

## 🎯 Project Goals

The main goal is not only to build an Employee Directory App, but also to learn how a software development team works together.

Interns gain practical experience with:

- Git and GitHub
- Branching
- Pull Requests
- Merge conflicts
- Code reviews
- Jira tickets
- Team communication
- Front-end development
- Testing
- GitHub Pages deployment

## 🤝 Contributing

Before starting a task:

1. Check your assigned Jira ticket.
2. Pull the latest version of the project.
3. Create a new branch.
4. Complete your assigned task.
5. Test your changes locally.
6. Commit and push your work.
7. Open a Pull Request.
8. Wait for review before merging.

Please avoid making changes directly to the `main` branch.

## 📚 LA Tech Rising Internship Project

This repository is used as a collaborative learning project for the **LA Tech Rising Internship Program**.

The project is designed to give interns practical experience working with real development tools, workflows, teamwork, and project management.

---

### Employee Directory App

**Build. Learn. Collaborate. Improve.**

🌐 Live App: https://siromidahmadi.github.io/employee-directory-app/


## Shared employee management

The public directory reads from Supabase. Use **Admin login** to add, edit, or remove employees and upload JPG, PNG, or WebP photos up to 2 MB. Saved changes appear on other devices after loading or refreshing the directory. All directory fields and photos are public; enter information intended for the public directory.

The existing six employee profiles have been imported. `data/employees.sample.json` is the original reference data, not the live database.

### One-time administrator setup

1. In the Employee App Supabase dashboard, open Authentication → Users → Add user → Create new user. Enter your own email and choose your password privately.
2. Copy that user's UUID. In Supabase SQL Editor, run the following with that exact UUID:

```sql
insert into public.directory_admins (user_id)
values ('YOUR_AUTH_USER_UUID') on conflict do nothing;
```

3. Open `admin.html` and sign in. Only users explicitly listed in `directory_admins` can write employee records or photos. There is no public admin registration. To revoke access, remove the user's membership through Supabase. Never put a service-role/secret key in this repository; `supabase-config.js` contains only the browser publishable key.

### Development and verification

Serve the repository with a local static web server. Run `npm ci`, `npm run check`, and `npm test`. The pinned Supabase browser SDK and its license are committed, so GitHub Pages requires no build step. Database policies and constraints are documented in `employee-directory.sql` (already applied to the connected project). Update/delete operations detect stale records instead of silently overwriting another session's changes.


## Current source files and cleanup

- `index.html` loads `directory.js` and `directory.css`, plus the navigation, clock, theme, and text-animation files referenced in its HTML.
- `admin.html` uses `admin.js`, `admin.css`, and the location picker. Its current hero animation is inline in `admin.html`.
- `employee-store.js` and `supabase-config.js` connect both pages to the shared database.
- `data/employees.sample.json` is reference data, not the live database.
- `docs/CHANGELOG.md` preserves the earlier development notes.
- `script.js` is retained temporarily because `departments.test.cjs` and the existing check command still reference it. Update and run those tests against `directory.js` before removing it.

The obsolete copied project folder, unused standalone hero script, legacy stylesheet, unused GIFs/theme icons, and macOS metadata have been removed from the working tree. Their earlier versions remain in Git history.
