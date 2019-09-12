// in quiz.html
function editId(val) {
    window.location = `addedit.html?id=${val}`;
}

// in quiz.html
function initPage() {
    loadNavBar();
    //initReward("/api/user/rewards/my");
}

function initReward(apiEndPoint) {
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
    let row = `<tr>
                  <td scope="row">${sno}</td>
                  <td><a href="#" onclick="loadReward(${val.id})">${val.name}</a></td>
                  <td>${val.availableQuantity}</td>
                  <td>${val.requiredPoints}</td>
                  <td>${String(val.expiry_date).split('T')[0]}</td>
              </tr>`;

    return row;
}

/**
*
* @param {*} e The event
*/
function saveOrUpdateReward(e) {
    e.preventDefault();
    var name = $("#name").val();
    var quantity = $("#quantity").val();
    var points = $("#points").val();
    var expiry_date = $("#expiry_date").val();
    const postData = {
        name: name,
        quantity: quantity,
        points: points,
        expiry_date: expiry_date
    };
    var myUrl = window.location.origin + `/api/user/rewards/create`;

    var id = $("#itemId").val();
    if (id) {
        postData.id = id;
        myUrl = myUrl.replace("create", "update");
    }

    const token = localStorage.getItem("token");
    $.ajax({
        headers: {
            Authorization: "Bearer " + token
        },
        url: myUrl,
        type: "post",
        data: postData,
        error: function (data) {
            console.log(data);
            $("#result").show();
            $("#result").html(data.statusText);
        },
        success: function (data) {
            $("#nav-reward").click();
        }
    });
}
