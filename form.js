// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD4SUZv72yA49WF70_dHbPS0BqymCIO4bk',
  authDomain: 'amilab-team.firebaseapp.com',
  projectId: 'amilab-team',
  storageBucket: 'amilab-team.appspot.com',
  messagingSenderId: '40603848507',
  appId: '1:40603848507:web:0be68d98fb60059414f11e',
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const firestore = firebase.firestore()
const adminEmail = 'admin@admin.com'
// const auth =firebase.auth();

//----------------------------
function signUp() {
  var name = document.getElementById('name').value
  var email = document.getElementById('email').value
  var password = document.getElementById('password').value
  document.getElementById('signUp').innerHTML =
    '<center> <p class="loader"></p> </center>'

  if (name === '' || email === '' || password === '') {
    return alert('Complete all fields')
  }

  //---------------------------

  firestore
    .collection('users')
    .where('email', '==', email)
    .get()
    .then((querySnapshot) => {
      console.log(querySnapshot)
      if (!querySnapshot.empty) {
        return window.alert('User CIP already exists')
      }
      firestore
        .collection('users')
        .add({
          name: name,
          email: email,
          password: password,
          money: 0,
        })
        .then((docRef) => {
          //--------------
          console.log('Document written with ID: ', docRef.id)
          //---------------

          alert('User signup successful')
          window.location.href = 'login.html'
        })
        .catch((error) => {
          console.error('Error adding document: ', error)
          alert('Error creating account')
        })
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
    .catch((error) => {
      console.log('Error getting documents: ', error)
      alert('Error creating account')
    })

  //------------------------
}

function signIn() {
  var email = document.getElementById('email').value
  var password = document.getElementById('password').value
  document.getElementById('signIn').innerHTML =
    '<center> <p class="loader"></p> </center>'

  if (!email || !password) {
    return alert('You have to fill in both email and password.')
  }

  // localStorage.setItem('email', email);

  firestore
    .collection('users')
    .where('email', '==', email)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        return window.alert('email does not exist')
      }
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data())
        if (doc.data().password === password) {
          // alert("correct password");
          const userData = { ...doc.data(), _id: doc.id }
          localStorage.setItem('user', JSON.stringify(userData))
          window.location.href = 'teapage.html'
        } else {
          alert('incorrect password')
        }
      })
    })
    .catch((error) => {
      console.log('Error getting documents: ', error)
      alert('Error logging in')
    })
}

function signOut() {
  localStorage.clear()
  window.location.href = '/login.html'
}

function addMoney() {
  if (!JSON.parse(localStorage.getItem('searchedUser'))) {
    return alert("Please enter a user's CIP first and update the balance.")
  }
  if (document.getElementById('addMoney').value <= 0) {
    return alert('Please enter a valid amount')
  }
  document.getElementById('moneySave').innerHTML =
    '<center> <p class="loader"></p> </center>'
  setTimeout(() => {
    const searchedUser = JSON.parse(localStorage.getItem('searchedUser'))
    console.log(searchedUser)
    const searchedUserAmount = document.getElementById('addMoney').value
    firestore
      .collection('users')
      .doc(searchedUser.id)
      .update({ money: Number(searchedUserAmount) })
      .then(() => {
        console.log('Document successfully updated!')
        window.alert(`Yay, you have updated ${searchedUser.name}'s balance.`)
        document.getElementById('email').value = ''
        document.getElementById('addMoney').value = ''
        localStorage.removeItem('searchedUser')
        document.getElementById('moneySave').innerHTML = 'Save'
      })
      .catch((error) => {
        window.alert("Error updating user's balance") // The document probably doesn't exist.
        console.error('Error updating document: ', error)
        document.getElementById('moneySave').innerHTML = 'Save'
      })
  }, 3000)
}

function search() {
  var email = document.getElementById('email').value
  if (email == '') {
    return alert('Please enter a valid CIP')
  }
  document.getElementById('search').innerHTML =
    '<center> <p class="loader"></p> </center>'
  setTimeout(() => {
    firestore
      .collection('users')
      .where('email', '==', email)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return window.alert(
            'Sorry. We did not find this user in our system. Please confirm that the email is valid and try again.',
          )
        }
        querySnapshot.forEach((doc) => {
          const searchedUser = doc.data()
          searchedUser.id = doc.id
          localStorage.setItem('searchedUser', JSON.stringify(searchedUser))
          document.getElementById('addMoney').value = searchedUser.money
          document.getElementById('search').innerHTML = 'Search'
        })
      })
      .catch((error) => {
        console.log('Error getting documents: ', error)
        document.getElementById('search').innerHTML = 'Search'
      })
  }, 3000)
}

function userIn() {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) {
    window.location.href = 'login.html'
  }

  document.getElementById('logged-in-user').innerHTML =
    '<a onClick = "signOut()" href = "">Sign Out</a>'

  if (user.email === adminEmail) {
    document.getElementById('admin-li').innerHTML =
      '<a href = "admin.html">Add Money</a>'
    document.getElementById('admin-li-add-tea').innerHTML =
      '<a href = "drinks.html">Tea Drinks</a>'
  }

  if (user.email !== adminEmail) {
    document.getElementById('balance').className = 'balance'
    document.getElementById(
      'balance',
    ).innerHTML = `<ion-icon name="person-circle-outline" class = "user-icon"></ion-icon> $${user.money}`
  }
}

async function proceed() {
  const money = 1 //this is the amount of all drinks.
  const { _id } = JSON.parse(localStorage.getItem('user'))
  let user = await firestore.collection('users').doc(_id).get()
  console.log({ user })
  user = user.data()

  if (user.money < money) {
    return window.alert(
      'You have insufficient amount to get a drink. Please speak to the admin',
    )
  }

  const newBalance = user.money - money
  const update = await firestore
    .collection('users')
    .doc(_id)
    .update({ money: newBalance })
  window.alert('Successfully ordered tea.')
  console.log({ update })
}

//---------------------------

async function createDrink() {
  const drinkname = document.getElementById('drinkname').value
  const drinkprice = document.getElementById('drinkprice').value
  const description = document.getElementById('description').value
  document.getElementById('savedrinkbtn').innerHTML =
  '<center> <p class="loader"></p> </center>'
  if (!drinkname || Number(drinkprice) <= 0) {
    return alert('Please fill the form appropriately.')
  }
  try {
    await firestore
      .collection('drinks')
      .add({ drinkname, drinkprice, description })
    alert('Drink successfully created.')
    getAllDrinks('admin')
    document.getElementById('savedrinkbtn').innerHTML = 'Save Drink'
  } catch (e) {
    console.log('Error getting documents: ', e)
    alert('Error creating drink')
    document.getElementById('savedrinkbtn').innerHTML = 'Save Drink'
  }
}

async function getAllDrinks(admin) {
  try {
    const allDrinks = []
    const drinks = await firestore.collection('drinks').get()
    for (doc of drinks.docs) {
      allDrinks.push({ ...doc.data(), id: doc.id })
    }

    localStorage.setItem('drinks', JSON.stringify(allDrinks))

    if (admin) {
      let drinksTable = ''
      for (const DRINK of allDrinks) {
        drinksTable += '<tr>'
        drinksTable += `<td scope="row"> ${allDrinks.indexOf(DRINK) + 1} </td>`
        drinksTable += '<td>' + DRINK.drinkname + '</td>'
        drinksTable += '<td> $ ' + DRINK.drinkprice + '</td>'
        drinksTable +=
          '<td>' +
          `<button class='delete' onclick={deleteDrink('${DRINK.id}')}>Delete</button>` +
          '</td>'
        drinksTable +=
          '<td>' +
          `<button class='delete' id = "editDrinkBtn" data-bs-toggle='modal' data-bs-target='#exampleModal' onclick = {setDrinkToEdit('${DRINK.id}')}> Edit Price </button>` +
          '</td>'
        drinksTable += '</tr>'
      }
      document.getElementById('drinks-list').innerHTML = drinksTable
    }
  } catch (e) {
    console.log('Error getting documents: ', e)
    alert('Error creating drink')
  }
}

function setDrinkToEdit(drinkId) {
  const drinks = JSON.parse(localStorage.getItem('drinks'))
  const selectedDrink = drinks.find((x) => x.id === drinkId)
  localStorage.setItem('selectedDrinkForEdit', JSON.stringify(selectedDrink))
}

//------------------------

function drinksearch() {
  var drink = document.getElementById('drink').value
  if (drink == '') {
    return alert('Enter drink')
  }
  document.getElementById('drinksearch').innerHTML =
    '<center> <p class="loader"></p> </center>'
  setTimeout(() => {
    firestore
      .collection('drinks')
      .where('drink', '==', drink)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return window.alert('drink does not exist')
        }
        querySnapshot.forEach((doc) => {
          const searchedDrink = doc.data()
          searchedDrink.id = doc.id
          localStorage.setItem('searchedDrink', JSON.stringify(searchedDrink))
          document.getElementById('addMoney').value = searchedDrink.money
        })
      })
      .catch((error) => {
        console.log('Error getting documents: ', error)
      })
    document.getElementById('search').innerHTML = 'search'
  }, 3000)
}

//-----------------------------

async function deleteDrink(drinkId) {
  try {
    const drinks = JSON.parse(localStorage.getItem('drinks'))
    const selectedDrink = drinks.find((x) => x.id === drinkId)
    const confirm = window.confirm(
      `Are you sure you want to delete ${selectedDrink.drinkname}?`,
    )
    if (confirm) {
      await firestore.collection('drinks').doc(drinkId).delete()
      window.alert('Drink Deleted Sucessfully')
      getAllDrinks('admin')
    }
  } catch (e) {
    console.log('error', e)
    alert('Sorry, operation delete drink failed. Please try again later')
  }
}

function getSelectedDrinkForEdit() {
  const drink = JSON.parse(localStorage.getItem('selectedDrinkForEdit'))
  document.getElementById('drinkname-edit').innerHTML = drink.drinkname
  document.getElementById('drinkprice-edit').value = drink.drinkprice
}

async function editDrink() {
  try {
    document.getElementById('savechanges').innerHTML =
      '<center> <p class="loader"></p> </center>'
    const newPrice = document.getElementById('drinkprice-edit').value
    console.log({ newPrice })
    const selectedDrink = JSON.parse(
      localStorage.getItem('selectedDrinkForEdit'),
    )
    console.log({ selectedDrink })
    await firestore
      .collection('drinks')
      .doc(selectedDrink.id)
      .update({ drinkprice: newPrice })
    getAllDrinks('admin')
    alert(
      `Success, price for drink ${selectedDrink.drinkname} change is successful!!`,
    )
    document.getElementById('savechanges').innerHTML = 'Save Changes'
    document.getElementById('closemodal').click()
  } catch (err) {
    console.log('error', err)
    document.getElementById('savechanges').innerHTML = 'Save Changes'
    alert('Sorry, operation edit drink failed. Please try again later.')
    document.getElementById('closemodal').click()
  }
}
