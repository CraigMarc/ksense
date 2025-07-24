

async function fetchPatients(page) {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    try {
        const response = await fetch('https://assessment.ksensetech.com/api/patients?page=' + page + '&limit=20', {
            method: 'GET',

            headers: { "x-api-key": "ak_39bd770d4512eac929930ddb075c86536d7232a3151f70c9" }

        })

        const patientData = await response.json();
      
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


    if (data1.error == 'Rate limit exceeded' || data1.error == 'Bad gateway' || data1.error == 'Internal server error' || data1.error == 'Service temporarily unavailable') {
        //data1 = await fetchPatients(1)
        getPatients()
    }
    else {
        patientArray.push(data1)
        pages = data1.pagination.totalPages
    }


    for (let i = 2; i <= pages; i++) {
       
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

function checkBloodPressure(currentPatient) {


    if (!currentPatient.blood_pressure || typeof currentPatient.blood_pressure !== 'string' || currentPatient.blood_pressure.includes('/') == false) {
        return null
    }


    let bloodPressure = currentPatient.blood_pressure.split('/')
    let systolic = bloodPressure[0]
    let diastolic = bloodPressure[1]

    if (/[0-9]|\./.test(systolic) == false || /[0-9]|\./.test(systolic) == false) {
        return null
    }

    if (systolic >= 140 || diastolic >= 90) {
        return 3
    }
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        return 2
    }
    if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
        return 1
    }
    if (systolic < 120 && diastolic < 80) {
        return 0
    }
    return null

}

function checkTemperature(currentPatient) {

    const temp = currentPatient.temperature

    if (temp <= 99.5) {
        return 0
    }
    if (temp > 99.5 && temp <= 100.9) {
        return 1
    }
    if (temp >= 101.0) {
        return 2
    }
    else {
        return null
    }

}

function checkAge(currentPatient) {
    const age = currentPatient.age

    if (typeof age == 'string') {
        return null
    }
    if (age < 40) {
        return 0
    }
    if (age >= 40 && age <= 65) {
        return 1
    }
    if (age > 65) {
        return 2
    }

}

async function processData() {


    let patientList = await getPatients()

    let high_risk_patients = []
    let fever_patients = []
    let data_quality_issues = []

    let totalPages = patientList.length
    for (i = 0; i < totalPages; i++) {
        let totalPatients = patientList[i].data.length
        for (x = 0; x < totalPatients; x++) {

            let currentPatient = patientList[i].data[x]
            //checkBloodPressure(currentPatient)
           
            let bpCheck = checkBloodPressure(currentPatient)
            let tempCheck = checkTemperature(currentPatient)
            let ageCheck = checkAge(currentPatient)
           

            let total_risk = bpCheck + tempCheck + ageCheck

            if (bpCheck == null || tempCheck == null || ageCheck == null) {
             
                data_quality_issues.push(currentPatient.patient_id)
            }

            if (tempCheck == 1 || tempCheck == 2) {
                
                fever_patients.push(currentPatient.patient_id)
            }

            if (total_risk >= 4) {
               
                high_risk_patients.push(currentPatient.patient_id)
            }



        }
    }


    let results = {
        high_risk_patients: high_risk_patients,
        fever_patients: fever_patients,
        data_quality_issues: data_quality_issues
    };

    sendResults(results)

}

async function sendResults(results) {
    console.log(results)
    const res = await fetch('https://assessment.ksensetech.com/api/submit-assessment', {
        method: 'POST',
        headers: { "x-api-key": "ak_39bd770d4512eac929930ddb075c86536d7232a3151f70c9" },
        body: JSON.stringify(results)
    });


    const json = await res.json();
    console.log('Submission response:', JSON.stringify(json))
}

processData()
