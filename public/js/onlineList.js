let userOnline = document.getElementById("userOnline");
let userList = document.getElementById("userList");
let userListClose = document.getElementById("userListClose");

userOnline.addEventListener('click', () => {
  console.log("show users online");
  userList.style.right = 0;
  userList.style.boxShadow = "2px 2px 30px 10px rgba(230, 230, 230, 0.2);";
});

userListClose.addEventListener('click', () => {
  userList.style.right = "-250px";
});