const OnlineList = {
  elements: {
    userOnlineBtn: document.getElementById("userOnline"),
    userListSidebar: document.getElementById("userList"),
    closeBtn: document.getElementById("userListClose")
  },

  init() {
    if (!this.elements.userOnlineBtn) return;

    this.elements.userOnlineBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.elements.userListSidebar.style.right = "0";
      this.elements.userListSidebar.style.boxShadow = "2px 2px 30px 10px rgba(0, 0, 0, 0.5)";
    });

    this.elements.userListClose.addEventListener('click', (e) => {
      e.preventDefault();
      this.elements.userListSidebar.style.right = "-250px";
      this.elements.userListSidebar.style.boxShadow = "none";
    });
  }
};

document.addEventListener('DOMContentLoaded', () => OnlineList.init());