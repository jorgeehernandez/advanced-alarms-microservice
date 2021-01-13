const getAll = require("./../utils/getAll");
const _ = require("lodash");

const isCommonRequest = ({ severity, status }) =>
  (!severity || typeof severity === "string") &&
  (!status || typeof status === "string");

const isStringifiedArray = string =>
  string && string.search(/^\[".+"\]/g) === 0;

const hasComodinAtEnd = value => value && value.charAt(value.length - 1) === "*";

async function getAlarms({ query, httpInstance }) {
  const promise = httpInstance.get("/alarm/alarms", {
    params: query
  });

  return getAll({
    promise,
    instance: httpInstance,
    key: "alarms"
  });
}

async function getAlarmsByStatusAndSeverities({
  status,
  severity,
  query,
  httpInstance
}) {
  const queryClone = { ...query };
  
  for (const key in queryClone) {
    const value = queryClone[key]

    if (value === 'false') queryClone[key] = false
    else if (value === 'true') queryClone[key] = true
  }

  if (severity !== "all") {
    queryClone.severity = severity.toUpperCase();
  }

  if (status !== "all") {
    queryClone.status = status.toUpperCase();
  }

  const promise = httpInstance.get("/alarm/alarms", {
    params: queryClone
  });


  return getAll({
    promise,
    instance: httpInstance,
    key: "alarms"
  });
}

function filterAlarmsByKeyValueComodin({ alarms, fragmentType, value, comodinWord }) {
  return _.filter(alarms, alarm => {
    if (fragmentType && value) {
      if (_.get(alarm, fragmentType) != value) return false;
    } else if (fragmentType) {
      if (!_.get(alarm, fragmentType)) return false;
    }

    if (comodinWord) {
      if (alarm.type.search(comodinWord) !== 0) return false;
    }

    return true;
  });
}

async function orderAlarms(unresolvedAlarms) {
  const resolvedAlarms = await Promise.all(unresolvedAlarms);

  return _.orderBy(
    _.flatten(resolvedAlarms),
    ({ time }) => new Date(time),
    ["desc"]
  );
}

/**
 * Procces request params and return the needed data
 * @param {object} argument
 * @param {object} argument.query
 * @param {function} argument.httpInstance
 */
async function processParams({ query, httpInstance }) {
  let { fragmentType, value, type, severity, status } = query;
  let comodinWord, alarms;

  delete query.fragmentType;
  delete query.value;

  if (hasComodinAtEnd(type)) {
    comodinWord = type.substr(0, type.length - 1);
    delete query.type;
  }

  if (isStringifiedArray(severity))
    severity = JSON.parse(severity);

  if (isStringifiedArray(status))
    status = JSON.parse(status);

  query.pageSize = 2000;
  // TODO this part can improve his readability and performance
  if (isCommonRequest({ severity, status })) {
    alarms = await getAlarms({ query, httpInstance });
  } else {
    delete query.severity;
    delete query.status;

    severity = severity || ["all"];
    status = status || ["all"];

    severity = severity instanceof Array ? severity : [severity];
    status = status instanceof Array ? status : [status];

    const unresolvedAlarms = severity.map(severity =>
      Promise.all(
        status.map(status =>
          getAlarmsByStatusAndSeverities({
            query,
            status,
            severity,
            httpInstance
          })
        )
      ).then(res => _.flatten(res))
    );

    alarms = await orderAlarms(unresolvedAlarms);
  }
  if (fragmentType || comodinWord)
    alarms = filterAlarmsByKeyValueComodin({ alarms, fragmentType, value, comodinWord });

  return alarms;
}

module.exports = processParams;
