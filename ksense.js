
async function fetchPatients(page) {


    let results = ""

    await fetch('https://assessment.ksensetech.com/api/patients?page=' + page + '&limit=10', {
        method: 'GET',
        //headers: myHeaders,
        headers: { "x-api-key": "ak_39bd770d4512eac929930ddb075c86536d7232a3151f70c9" }

    })
        .then(response => response.json())
        .then(data => {
            
            return getPatientList(data)
        });
        

}





async function getPatientList(data) {
   
    console.log(data)
}

fetchPatients(1)

