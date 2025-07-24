

async function fetchPatients(page) {


    try {
        const response = await fetch('https://assessment.ksensetech.com/api/patients?page=' + page + '&limit=10', {
            method: 'GET',
           
            headers: { "x-api-key": "ak_39bd770d4512eac929930ddb075c86536d7232a3151f70c9" }

        })

        const forecastData = await response.json();

       
        return (forecastData)

    }
    catch (error) {
        console.error("There has been a problem with your fetch operation:", error);
        
    }
}



async function getPatients() {

let patientArray = []
data1 = await fetchPatients(1)
patientArray.push(data1)
console.log(data1)

let pages = data1.pagination.totalPages

for (let i=2; i <= pages; i++) {
    let data2 = await fetchPatients(i)
    patientArray.push(data2)
}
    return patientArray
}


async function processData () {
    let patientList = await getPatients()
    console.log(patientList)
}

processData()

/*
function addPatient(data) {
    patientArray.push(data)
    pages = data.pagination.totalPages
    console.log(pages)
}


async function getPatientList(data) {
   
console.log(await fetchPatients(1))
    console.log(pages)
    for (let i=2; i<=pages; i++) {
        fetchPatients(i)
    }


}

getPatientList()
console.log(patientArray)*/