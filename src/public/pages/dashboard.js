function checkPlayerPassword() {
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
            if (!data.changed) {
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

function loadPlayerDashboard() {
    var token = localStorage.getItem("token");
    var myUrl = window.location.origin + '/api/user/profile';

    $.ajax({
        headers: {
            Authorization: 'Bearer ' + token
        },
        url: myUrl,
        type: 'get',
        error: function (data) {
            console.log("We'll log user out because of error fetching dashboard data: ");
            console.log(data);
            logout();
        },
        success: function (data) {
            $('#aquiz').html(data.nQuizAnswered);
            $('#apoll').html(data.nSurveyAnswered);
            $('#redeemed').html(data.nPoints ? data.nPoints.totalRedeemed : 0);
            $('#available').html(data.nPoints ? data.nPoints.availablePoints : 0);
        }
    });
}

function loadAvailableRewards() {
    var token = localStorage.getItem("token");
    var myUrl = window.location.origin + '/api/user/rewards/player';
    $.ajax({
        headers: {
            Authorization: 'Bearer ' + token
        },
        url: myUrl,
        type: 'get',
        error: function (data) {
            console.log(data);
        },
        success: function (data) {
            let rows = "";
            $.each(data, function (i, element) {
                rows += `
          <tr>
              <td>${i + 1}</td>
              <td>${element.name}</td>
              <td>${element.requiredPoints}</td>
          </tr>
          `;
            });

            $("#rewardsTable tbody").html(rows);
        }
    });
}