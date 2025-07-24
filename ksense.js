
fetch('https://assessment.ksensetech.com/api/patients', {
    method: 'GET',
    //headers: myHeaders,
    headers: {"x-api-key": "ak_39bd770d4512eac929930ddb075c86536d7232a3151f70c9"}

})
    .then(response => response.json())
    .then(data => {
        console.log('API Results:', data);
    });

