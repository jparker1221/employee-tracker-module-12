// Install required dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Connect to database
const db = mysql.createConnection(
  {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "employees_db"
  },
  console.log(`Connected to the employees_db database.`)
);

db.connect((err) => {
  if (err) throw err;
  start();
})

// Function to start employee tracker application
function start() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Quit",
      ]
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewAllDepartments();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Quit":
          quit();
          break;
      }
    });
}
// Function to view all departments
function viewAllDepartments() {
  const query = "SELECT * FROM department";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all roles
function viewAllRoles() {
  const query = "SELECT * FROM role";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to view all employees
function viewAllEmployees() {
  const query = "SELECT * FROM employee";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// Function to add a department
function addDepartment() {
  inquirer.prompt([
    {
      name: "department_name",
      type: "input",
      message: "What would you like to call the new department?",
    }
  ])
    .then((answers) => {
      const query = "INSERT INTO department SET ?";
      db.query(query, answers, (err, res) => {
        if (err) throw err;
        console.table(res);
        console.log(`The ${answers.department_name} department has been created.`)
        start();
      })
    })
}

// Function to add a role
function addRole() {
  const query = "SELECT * FROM department";
  db.query(query, (err, res) => {
    if (err) throw err;
    const departmentArray = res.map((dpt) => (
      {
        name: dpt.department_name,
        value: dpt.id,
      }
    ))
    // console.log(departmentArray)
    inquirer.prompt(
      [
        {
          name: "title",
          type: "input",
          message: "What is the title for this role?",
        },
        {
          name: "salary",
          type: "number",
          message: "What is the salary for this role?",
        },
        {
          name: "department_id",
          type: "list",
          message: "Choose a department for this role:",
          choices: departmentArray,
        },
      ]
    )
      .then((answers) => {
        const query = "INSERT INTO role SET ?"
        db.query(query, answers, (err, res) => {
          if (err) throw err;
          console.table(res);
          console.log(`The role of ${answers.title} has been created.`)
          start();
        })
      }
      )
  });
}

// Function to add an employee
function addEmployee() {
  const query = "SELECT * FROM employee WHERE manager_id IS NULL";
  db.query(query, (err, res) => {
    if (err) throw err;
    const employeeArray = res.map((emp) => (
      {
        name: emp.first_name,
        value: emp.id,
      }
    ))
    const query = "SELECT * FROM role";
    db.query(query, (err, res) => {
      if (err) throw err;
      const roleArray = res.map((role) => (
        {
          name: role.title,
          value: role.id,
        }
      ))
      // console.log(departmentArray)
      inquirer.prompt(
        [
          {
            name: "first_name",
            type: "input",
            message: "What is the first name of this employee?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is the last name of this employee?",
          },
          {
            name: "role_id",
            type: "list",
            message: "Choose a role for this employee:",
            choices: roleArray,
          },
          {
            name: "manager_id",
            type: "list",
            message: "Choose your employee's manager:",
            choices: employeeArray,
          }
        ]
      )
        .then((answers) => {
          const query = "INSERT INTO employee SET ?"
          db.query(query, answers, (err, res) => {
            if (err) throw err;
            console.table(res);
            console.log(`${answers.first_name} ${answers.last_name} has been added to the database.`)
            start();
          })
        }
        )
    });
  });
}

// Function to update an employee role
function updateEmployeeRole() {
  const query = "SELECT * FROM employee";
  db.query(query, (err, res) => {
    if (err) throw err;
    const employeeArray = res.map((emp) => (
      {
        name: emp.first_name,
        value: emp.id,
      }
    ))
    const query = "SELECT * FROM role";
    db.query(query, (err, res) => {
      if (err) throw err;
      const roleArray = res.map((role) => (
        {
          name: role.title,
          value: role.id,
        }
      ))
      inquirer.prompt(
        [
          {
            name: "employee",
            type: "list",
            message: "Which employee's role do you want to update?",
            choices: employeeArray,
          },
          {
            name: "role_id",
            type: "list",
            message: "Choose a new role for this employee:",
            choices: roleArray,
          },

        ]
      )
        .then((answers) => {
          const query = "UPDATE employee SET role_id = ? WHERE id = ?"
          db.query(query, answers, (err, res) => {
            if (err) throw err;
            console.table(res);
            console.log(`${answers.employee}'s role has been updated to ${answers.role_id}.`)
            start();
          })
        }
        )
    });
  });
}

// Function to quit application
function quit() {
  db.end();
  console.log('Goodbye!');
}