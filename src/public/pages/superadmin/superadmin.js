$("#nav-user").click(function () {
  $("#viewDiv").load("users/users.html");
});

$("#nav-vote").click(function () {
  $("#viewDiv").load("votes/votes.html");
});

$("#nav-quiz").click(function () {
  $("#viewDiv").load("quizzes/quizzes.html");
});

$("#nav-reward").click(function () {
  $("#viewDiv").load("rewards/rewards.html");
});

$("#nav-audit").click(function () {
  $("#viewDiv").load("audit/audit.html");
});

function loadVotes() {
  const myUrl = window.location.origin + "/superadmin/super.json";

  $.ajax({
    url: myUrl,
    type: "GET",

    error: function (error) {
      console.log(error);
    },
    success: function (success) {
      $.each(success.vote, function (key, val) {
        var id = key++;

        $("#result").append(
          `
                <tr>
                <td>` +
          key++ +
          `</td>
                <td>` +
          val.title +
          `</td>
                <td>` +
          val.description +
          `</td>
                <td>` +
          val.poll +
          `</td>
                <td>` +
          val.users +
          `</td>
                <td><a href="../superadmin/vote-details.html" class="btn btn-brand btn-sm">View details</a>
            </tr>
                `
        );
      });
    }
  });
}

function loadReward(id) {
  debugger;
  var myUrl = window.location.origin + `/api/user/rewards/${id}`;
  const token = localStorage.getItem("token");
  $.ajax({
    headers: {
      Authorization: "Bearer " + token
    },
    url: myUrl,
    type: "get",
    data: {},
    error: function (data) {
      console.log(data);
      $("#result").show();
      $("#result").html(data.statusText);
    },
    success: function (data) {
      $('#viewDiv').load('rewards/addedit.html', function () {
        $("#itemId").val(data.id);
        $("#name").val(data.name);
        $("#points").val(data.requiredPoints);
        $("#quantity").val(data.availableQuantity);
        $("#expiry_date").val(prepareSqlDate(data.expiry_date));
      });
    }
  });
}

function prepareSqlDate(d) {
  var now = new Date();
  var strDate = String(d).split('T')[0].split('-');
  return strDate[0] + "-" + strDate[1] + "-" + strDate[2];
}
