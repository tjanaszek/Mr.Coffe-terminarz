const crypto = require('crypto');

module.exports.users = [
    {
        'firstname': "James",
        'lastname': "Bond",
        'email': "james.bond@gmail.com",
        'password': "b6b7fb4cad4bc020f76e16889a8e9065cb708d0f8c304a8a3db609b644da9536"  
    },
    {
        'firstname': "Tony",
        'lastname': "Stark",
        'email': "starkrulz@gmail.com",
        'password': "a836ebba36776b21dd0f5cdca497bff65c5bdfc8411cfbfe0111f27bde1c1894"  
    },
    {
        'firstname': "Ali",
        'lastname': "G",
        'email': "nameisnotborat@gmail.com",
        'password': "3b5fe14857124335bb8832cc602f8edcfa12db42be36b135bef5bca47e3f2b9c"  
    }
]

module.exports.schedules = [
    {
        'user_id': 0,
        'day': 1,
        'start_at': "2PM",
        'end_at': "4PM"
    },
    {
        'user_id': 0,
        'day': 2,
        'start_at': "2PM",
        'end_at': "4PM"
    },
    {
        'user_id': 0,
        'day': 3,
        'start_at': "2PM",
        'end_at': "4PM"
    },
    {
        'user_id': 2,
        'day': 5,
        'start_at': "8AM",
        'end_at': "6PM"
    }
]


module.exports.getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

module.exports.generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex');
}

module.exports.numberToWeekDay=(number) =>{
    switch(number){
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
        case 7:
            return "Sunday";
        default:
            return "incorrect day"     
    }
}