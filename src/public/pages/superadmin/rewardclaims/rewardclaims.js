function initRewardClaim(apiEndPoint) {
    loadGridFooter();
    loadData(1, apiEndPoint);
    $("#search").on("input", function () {
        loadData(1, apiEndPoint);
    });
    $("#perPage").on("change", function () {
        loadData(1, apiEndPoint);
    });
    $("#gridFooter").on("click", "li.paginate_button", function () {
        const li = $(this);
        if (!li.hasClass("disabled")) loadData(parseInt(li.attr("pgInd")), apiEndPoint);
    });
}

function loadData(page, apiEndPoint) {
    console.log("loadData: apiEndPoint = " + apiEndPoint);
    const token = localStorage.getItem("token");
    const myUrl = window.location.origin + apiEndPoint;
    const queryData = {
        name: $("#search").val(),
        perPage: $("#perPage").val(),
        page: page
    };
    $.ajax({
        headers: {
            Authorization: "Bearer " + token
        },
        url: myUrl,
        type: "get",
        data: queryData,
        error: function (data) {
            console.log(data);
            $("#result").show();
            $("#result").html("Error fetching data. " + data.statusText);
        },
        success: function (data) {
            console.log(data);
            let rows = "";
            $.each(data.data, function (key, val) {
                const sno = data.pagination.from + key;
                rows += getOneUserRow(sno, val);
            });
            $("table tbody").html(rows);

            // set paging narrative and nav buttons
            setPagingInfo(data.pagination);
        }
    });
}

function getOneUserRow(sno, val) {
    let action = val.approved? `<button class="btn btn-warning btn-block btn-sm" 
    onclick="fulfillClaim(${val.id})">Delivered</button>`:
    `<button class="btn btn-success btn-block btn-sm" onclick="approveClaim(${val.id})">Approve</button>`;
    let row = `<tr>
                  <td scope="row">${sno}</td>
                  <td>${val.lastname} ${val.firstname} [${val.username}]</td>
                  <td>${val.name}</td>
                  <td>${val.requiredPoints}</td>
                  <td>${String(val.updated_at).split('T')[0]}</td>
                  <td>${action}</td>
              </tr>`;

    return row;
}

function approveClaim(id){
    var token = localStorage.getItem("token");
    var myUrl = window.location.origin + `/api/user/rewardclaims/approve/${id}`;
    $.ajax({
        headers: {
            Authorization: 'Bearer ' + token
        },
        url: myUrl,
        type: 'post',
        error: function (data) {
            console.log(data);
        },
        success: function (data) {
            Swal.fire({
                type: "success",
                html: "<h4>Reward Claim Approved!</h4>",
                width: 400,
                showConfirmButton: true,
                confirmButtonText: "Ok",
                confirmButtonColor: "#05164d"
            }).then(function () {
                $("#nav-rewardclaim").click();
            });
        }
    });
}

function fulfillClaim(id){
    var token = localStorage.getItem("token");
    var myUrl = window.location.origin + `/api/user/rewardclaims/fulfill/${id}`;
    $.ajax({
        headers: {
            Authorization: 'Bearer ' + token
        },
        url: myUrl,
        type: 'post',
        error: function (data) {
            console.log(data);
        },
        success: function (data) {
            Swal.fire({
                type: "success",
                html: `<h4 class='text-center'>System has been 
                notified of your successful delivery!</h4>`,
                width: 400,
                showConfirmButton: true,
                confirmButtonText: "Ok",
                confirmButtonColor: "#05164d"
            }).then(function () {
                $("#nav-rewardclaim").click();
            });
        }
    });
}