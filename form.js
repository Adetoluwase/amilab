// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyD4SUZv72yA49WF70_dHbPS0BqymCIO4bk',
  authDomain: 'amilab-team.firebaseapp.com',
  projectId: 'amilab-team',
  storageBucket: 'amilab-team.appspot.com',
  messagingSenderId: '40603848507',
  appId: '1:40603848507:web:0be68d98fb60059414f11e',
};
// Initialize Firebase
firebase.initializeApp (firebaseConfig);
var firestore = firebase.firestore ();
// const auth =firebase.auth();

//----------------------------
function signUp () {
  var name = document.getElementById ('name').value;
  var email = document.getElementById ('email').value;
  var password = document.getElementById ('password').value;
   document.getElementById(
      'signUp').innerHTML = '<center> <p class="loader"></p> </center>';

  if (name === '' || email === '' || password === '') {
    return alert ('Complete all fields');
  }

  //---------------------------

  firestore
    .collection ('users')
    .where ('email', '==', email)
    .get ()
    .then (querySnapshot => {
      console.log (querySnapshot);
      if (!querySnapshot.empty) {
        return window.alert ('User CIP already exists');
      }
      firestore
        .collection ('users')
        .add ({
          name: name,
          email: email,
          password: password,
          money: 0,
        })
        .then (docRef => {
          //--------------
          console.log ('Document written with ID: ', docRef.id);
          //---------------

          alert ('User signup successful');
          window.location.href = 'login.html';
        })
        .catch (error => {
          console.error ('Error adding document: ', error);
          alert ('Error creating account');
        });
      // querySnapshot.forEach((doc) => {

      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      //---
      // if (doc.data().email === email){
      //   return console.log ("User CIP already Exists")
      // return alert("User CIP already Exists");
      // }
      //----
      // });
    })
    .catch (error => {
      console.log ('Error getting documents: ', error);
      alert ('Error creating account');
    });

  //------------------------
}

function signIn () {
  var email = document.getElementById ('email').value;
  var password = document.getElementById ('password').value;
  document.getElementById(
      'signIn').innerHTML = '<center> <p class="loader"></p> </center>';

  if (!email || !password) {
    return alert ('You have to fill in both email and password.');
  }

  // localStorage.setItem('email', email);

  firestore
    .collection ('users')
    .where ('email', '==', email)
    .get ()
    .then (querySnapshot => {
      if (querySnapshot.empty) {
        return window.alert ('email does not exist');
      }
      querySnapshot.forEach (doc => {
        // doc.data() is never undefined for query doc snapshots
        console.log (doc.id, ' => ', doc.data ());
        if (doc.data ().password === password) {
          // alert("correct password");
          const userData = {...doc.data (), _id: doc.id};
          localStorage.setItem ('user', JSON.stringify (userData));
          window.location.href = 'teapage.html';
        } else {
          alert ('incorrect password');
        }
      });
    })
    .catch (error => {
      console.log ('Error getting documents: ', error);
      alert ('Error logging in');
    });
}

function signOut () {
  localStorage.removeItem ('user');
  window.location.href = 'login.html';
}

function addMoney () {
  if (document.getElementById ('addMoney').value <= 0) {
    return alert ('Enter valid amount');
  }
  document.getElementById ('moneySave').innerHTML =
    '<center> <p class="loader"></p> </center>';
  setTimeout (() => {
    const searchedUser = JSON.parse (localStorage.getItem ('searchedUser'));

    console.log (searchedUser);

    const searchedUserAmount = document.getElementById ('addMoney').value;
    firestore
      .collection ('users')
      .doc (searchedUser.id)
      .update ({money: Number (searchedUserAmount)})
      .then (() => {
        console.log ('Document successfully updated!');
        window.alert ("Success, you have updated the user's amount");
        document.getElementById ('email').value = '';
        document.getElementById ('addMoney').value = '';
      })
      .catch (error => {
        window.alert ("Error updating user's amount"); // The document probably doesn't exist.
        console.error ('Error updating document: ', error);
      });
    document.getElementById ('moneySave').innerHTML = 'Save';
  }, 3000);
}

function search () {
  var email = document.getElementById ('email').value;
  if (email == '') {
    return alert ('Enter CIP');
  }
  document.getElementById ('search').innerHTML =
    '<center> <p class="loader"></p> </center>';
  setTimeout (() => {
    firestore
      .collection ('users')
      .where ('email', '==', email)
      .get ()
      .then (querySnapshot => {
        if (querySnapshot.empty) {
          return window.alert ('email does not exist');
        }
        querySnapshot.forEach (doc => {
          const searchedUser = doc.data ();
          searchedUser.id = doc.id;
          localStorage.setItem ('searchedUser', JSON.stringify (searchedUser));
          document.getElementById ('addMoney').value = searchedUser.money;
        });
      })
      .catch (error => {
        console.log ('Error getting documents: ', error);
      });
    document.getElementById ('search').innerHTML = 'search';
  }, 3000);
}

function assignLink () {
  if (JSON.parse (localStorage.getItem ('user')).name === 'admin') {
    document.getElementById ('admin-li').innerHTML =
      '<a href = "admin.html">Add Money</a>';
    document.getElementById ('admin-li-add-tea').innerHTML =
      '<a href = "drinks.html">Tea Drinks</a>';
  }
}

function userIn () {
  if (!JSON.parse (localStorage.getItem ('user'))) {
    window.location.href = 'login.html';
  }

  if (JSON.parse (localStorage.getItem ('user'))) {
    document.getElementById ('logged-in-user').innerHTML =
      '<a onClick = "signOut()" href = "">Sign Out</a>';
  }
}

async function proceed () {
  const money = 1; //this is the amount of all drinks.
  const {_id} = JSON.parse (localStorage.getItem ('user'));
  let user = await firestore.collection ('users').doc (_id).get ();
  console.log ({user});
  user = user.data ();

  if (user.money < money) {
    return window.alert (
      'You have insufficient amount to get a drink. Please speak to the admin'
    );
  }

  const newBalance = user.money - money;
  const update = await firestore
    .collection ('users')
    .doc (_id)
    .update ({money: newBalance});
  window.alert ('Successfully ordered tea.');
  console.log ({update});
}

//---------------------------

async function createDrink () {
  const drinkname = document.getElementById ('drinkname').value;
  const drinkprice = document.getElementById ('drinkprice').value;
  const description = document.getElementById ('description').value;
  if (!drinkname || Number (drinkprice) <= 0) {
    return alert ('Please fill the form appropriately.');
  }
  try {
    await firestore
      .collection ('drinks')
      .add ({drinkname, drinkprice, description});
    alert ('Drink successfully created.');
    getAllDrinks ();
  } catch (e) {
    console.log ('Error getting documents: ', e);
    alert ('Error creating drink');
  }
}

async function getAllDrinks (admin) {
  try {
    const allDrinks = [];
    const drinks = await firestore.collection ('drinks').get ();
    console.log ({drinks});
    for (doc of drinks.docs) {
      allDrinks.push (doc.data ());
    }
    if (admin)
      document.getElementById ('drinks-list').innerHTML = allDrinks.map (
        (drink, id) =>
          `<tr><th> ${id + 1} </th><td>${drink.drinkname}</td><td>${drink.drinkprice}</td></tr>`
      );
  } catch (e) {
    console.log ('Error getting documents: ', e);
    alert ('Error creating drink');
  }
}

//------------------------

function drinksearch () {
  var email = document.getElementById ('drink').value;
  if (drink == '') {
    return alert ('Enter drink');
  }
  document.getElementById ('drinksearch').innerHTML =
    '<center> <p class="loader"></p> </center>';
  setTimeout (() => {
    firestore
      .collection ('drinks')
      .where ('drink', '==', drink)
      .get ()
      .then (querySnapshot => {
        if (querySnapshot.empty) {
          return window.alert ('drink does not exist');
        }
        querySnapshot.forEach (doc => {
          const searchedDrink = doc.data ();
          searchedDrink.id = doc.id;
          localStorage.setItem (
            'searchedDrink',
            JSON.stringify (searchedDrink)
          );
          document.getElementById ('addMoney').value = searchedDrink.money;
        });
      })
      .catch (error => {
        console.log ('Error getting documents: ', error);
      });
    document.getElementById ('search').innerHTML = 'search';
  }, 3000);
}

//-----------------------------

// function deletedrink(){
//   firestore.collection("drinks").where("drink", "==" drink).delete().then(() => {
//     console.log("Drink successfully deleted!");
// }).catch((error) => {
//     console.error("Error removing document: ", error);
// });
// }
