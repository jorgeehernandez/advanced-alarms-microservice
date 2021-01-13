# Advanced filter alarms microservice  fro Cumulocity IoT platform

### Request structure  

https://{tenant}.{instance}.com/service/bsk-alarms-filters/alarms?{...params}  

### /alarms endpoint 

#### Available params
```js
    // type could be used as type_* and will retrieve all the alarms which his type match with "type_" at the start
    {
        type: 'alarm type',
        severity: ["critical", "major"],
        status: ["active"],
        dateFrom: '2018-01-16T18:38:44.466+01:00',
        dateTo: '2018-01-16T18:38:44.466+01:00',
        source: '12323',
        fragmentType: '',
        value: ''
    }
```
#### Expected response  
```js
    {
        alarms: [
        ...alarms
        ]

    }
```
