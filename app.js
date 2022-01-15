const express = require("express");
const app = express();
const users = require("./users.json");
// fs.readFileSync()
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Home Page");
});
// add users jason file/ Show details of all users
app.get("/users", (req, res) => {
  res.send(users);
});
// add new users
app.post("/users", (req, res) => {
  const { id } = req.body;
  const newUser = { id: id, cash: 0, credit: 0 };
  if (users.find((user) => user.id === newUser.id)) {
    return res
      .status(400)
      .send({ error: 400, message: "user is already in the bank" });
  }
  console.log(users);
  users.push(newUser);
  res.send(newUser);
});

// Depositing
app.put("/users/deposit/:id", (req, res) => {
  const id = req.params.id;
  const { cash } = req.body;
  if (cash === undefined)
    return res
      .status(400)
      .send({ error: 400, message: "Please enter an amount of cash" });
  const updateUser = { id: id, cash: cash, credit: 0 };
  if (deposit(cash, updateUser)) return res.send(updateUser);
  else
    return res
      .status(400)
      .send({
        error: 400,
        message: "Can't deposit because user doesn't exist in the bank",
      });
});
// Update credit
app.put("/users/credit/:id", (req, res) => {
  const id = req.params.id;
  const { credit } = req.body;
  if (credit === undefined)
    return res
      .status(400)
      .send({ error: 400, message: "Please enter an amount of cash" });
  const updateUser = { id: id, cash: 0, credit: credit };
  if (addCredit(credit, updateUser)) return res.send(updateUser);
  else
    return res
      .status(400)
      .send({
        error: 400,
        message:
          "Can't update a users credit because user doesn't exist in the bank",
      });
});
// Withdraw money
app.put("/users/withdraw/:id", (req, res) => {
  const id = req.params.id;
  const { cash } = req.body;
  if (cash === undefined)
    return res
      .status(400)
      .send({ error: 400, message: "Please enter an amount of cash" });
  const updateUser = { id: id, cash: cash, credit: 0 };
  const withdraw1 = withdraw(cash, updateUser);
  if(withdraw1===true) return res.send(updateUser);
  else if (withdraw1 === 3) return res.status(400).send({error: 400,message: "Can't Withdraw because the cash and credit run out"})
  else
    return res
      .status(400)
      .send({
        error: 400,
        message: "Can't Withdraw because user doesn't exist in the bank",
      });
});
// Transferring
app.put("/users/transfer/:id", (req, res) => {
  const id = req.params.id;
  const { cash } = req.body;
  const toId = req.body.id;
  if (cash === undefined || toId === undefined)
    return res
      .status(400)
      .send({
        error: 400,
        message: "Please enter an amount of cash and/or id ",
      });
  const updateUser = { id: id, cash: cash, credit: 0 };
  const withdraw1 = withdraw(cash, updateUser)
  if (withdraw1 === true ){
    const updateUser2 = { id: toId, cash: cash, credit: 0 };
    if(!deposit(cash, updateUser2)) console.log("deposit");
    return res.send(updateUser);
  }
  else if (withdraw1 === 3) return res.status(400).send({error: 400,message: "Can't Withdraw because the cash and credit run out"})
  else
  return res
    .status(400)
    .send({
      error: 400,
      message: "Can't Withdraw because user doesn't exist in the bank",
    });
});

// get user
app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  const foundUser = { id: id, cash: 0, credit: 0 };
  if (
    !users.find((user) => {
      if (user.id === Number(id)) {
        res.send(user);
      }
    }));
  else
    return res
      .status(400)
      .send({ error: 400, message: "user is already in the bank" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listentinig to port: ${PORT}`);
  console.log();
});



function deposit(cash, updateUser) {
  if (
    !users.find((user) => {
      if (user.id === Number(updateUser.id)) {
        user.cash += cash;
        updateUser.cash = user.cash;
        updateUser.credit = user.credit;
      }
    })
  ) return true;
  else {
    return false};
}
function addCredit(credit, updateUser) {
  if (
    !users.find((user) => {
      if (user.id === Number(updateUser.id)) {
        user.credit += credit;
        updateUser.credit = user.credit;
        updateUser.cash = user.cash;
      }
    })
  ) return true;
  else {
    return false};
}
function withdraw(cash, updateUser) {
  let flag; 
  if (
    !users.find((user) => {
      if (user.cash >= cash) {
        user.cash -= cash;
        updateUser.cash = user.cash;
        updateUser.credit = user.credit;
        flag = true;
      } 
      else if (user.credit >= cash) {
        user.cash -= cash;
        updateUser.cash = user.cash;
        user.credit -= cash;
        updateUser.credit = user.credit;
        flag = true;
      } 
      else if (user.id === Number(updateUser.id)) {
        if (user.credit + user.cash >= cash) {
          user.cash -= cash;
          user.credit += user.cash;
          updateUser.cash = user.cash;
          updateUser.credit = user.credit;
          flag = true;
        } else flag = 3;
      }
    })
  );
  else flag = false;
  return flag;
}