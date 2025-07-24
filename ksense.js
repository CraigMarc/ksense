const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchPatients(page) {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    try {
        const response = await fetch('https://assessment.ksensetech.com/api/patients?page=' + page + '&limit=20', {
            method: 'GET',

            headers: { "x-api-key": "ak_39bd770d4512eac929930ddb075c86536d7232a3151f70c9" }

        })

        const patientData = await response.json();
        console.log(response.status)
        if (response.status == 500 || response.status == 502 || response.status == 503) {
            fetchPatients(page)
            //return patientData
        }
        if (response.status === 429) {
            // Calculate delay with exponential backoff
            const delay = 20000;
            console.log(`Rate limited. Retrying in ${delay}ms`);
            await wait(delay);
            fetchPatients(page)
            //return patientData
        }

        return patientData

    }
    catch (error) {
        console.error("There has been a problem with your fetch operation:", error);

    }
}



async function getPatients() {

    let pages = 0
    let patientArray = []
    data1 = await fetchPatients(1)

    console.log(data1)

    if (data1.error == 'Rate limit exceeded' || data1.error == 'Bad gateway' || data1.error == 'Internal server error' || data1.error == 'Service temporarily unavailable') {
        //data1 = await fetchPatients(1)
        getPatients()
    }
    else {
        patientArray.push(data1)
        pages = data1.pagination.totalPages
    }


    for (let i = 2; i <= pages; i++) {
        console.log(i + "iter")
        console.log(pages + "total pages")
        let data2 = await fetchPatients(i)
        if (data2.error == 'Rate limit exceeded' || data2.error == 'Bad gateway' || data2.error == 'Internal server error' || data2.error == 'Service temporarily unavailable') {
            data2 = await fetchPatients(i)
            i--
        }
        else {
            patientArray.push(data2)
        }

    }
    return patientArray
}


async function processData() {
    let patientList = await getPatients()
    console.log(patientList)
}

processData()
