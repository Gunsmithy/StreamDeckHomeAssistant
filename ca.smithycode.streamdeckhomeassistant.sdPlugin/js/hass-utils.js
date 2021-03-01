function getScheme() {
  if (globalSettings.secure === false) {
    return 'http';
  } else {
    return 'https';
  }
}

async function getAllHassStates(endpoint, token) {
    const response = await fetch(`${getScheme()}://${endpoint}/api/states`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    const states = await response.json();
    return states;
}

async function getAllHassServices(endpoint, token) {
  const response = await fetch(`${getScheme()}://${endpoint}/api/services`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  const services = await response.json();
  return services;
}

async function callRefreshBinarySensor(endpoint, token, entity_id) {
  const response = await fetch(`${getScheme()}://${endpoint}/api/states/${entity_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  const state = await response.json();
  return state;
}

async function callToggleCover(endpoint, token, entity_id) {
  const response = await fetch(`${getScheme()}://${endpoint}/api/services/cover/toggle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          "entity_id": entity_id,
      }),
    });
}

async function callToggleLight(endpoint, token, entity_id) {
    const response = await fetch(`${getScheme()}://${endpoint}/api/services/light/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "entity_id": entity_id,
        }),
      });
}

async function callLockUnlock(endpoint, token, entity_id, code) {
  const body = {
    "entity_id": entity_id,
  };
  if (code) {
    body.code = code;
  }
  const response = await fetch(`${getScheme()}://${endpoint}/api/services/lock/unlock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
}

async function callLockLock(endpoint, token, entity_id, code) {
  const body = {
    "entity_id": entity_id,
  };
  if (code) {
    body.code = code;
  }
  const response = await fetch(`${getScheme()}://${endpoint}/api/services/lock/lock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
}

async function callToggleSwitch(endpoint, token, entity_id) {
    const response = await fetch(`${getScheme()}://${endpoint}/api/services/switch/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "entity_id": entity_id,
        }),
      });
}

async function callService(endpoint, token, service_id, payload) {
  const serviceArray = service_id.split('.');
  const response = await fetch(`${getScheme()}://${endpoint}/api/services/${serviceArray[0]}/${serviceArray[1]}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    });
}
