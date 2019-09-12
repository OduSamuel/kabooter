function checkPlayerPassword(){
    var token = localStorage.getItem("token");
    var myUrl = window.location.origin + '/api/user/checkpassword';
    $.ajax({
        headers: {
            Authorization: 'Bearer ' + token
        },
        url: myUrl,
        type: 'post',
        error: function (data) {
            console.log("We'll log user out because of error checking password: ");
            console.log(data);
            logout();
        },
        success: function (data) {
            if(!data.changed){
                Swal.fire({
                    type: "warning",
                    html: $("#pwdChangeMsg").html(),
                    width: 600,
                    showConfirmButton: true,
                    confirmButtonText: "Change it now",
                    confirmButtonColor: "#05164d"
                  }).then(function () {
                    window.location = "/pages/change-password.html";
                });
            }
        }
    });
}

function loadPlayerDashboard(){
    var token = localStorage.getItem("token");
    var myUrl = window.location.origin + '/api/user/profile';
}