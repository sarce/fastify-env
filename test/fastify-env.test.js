'use strict'

const t = require('tap')
const Fastify = require('fastify')
const fastifyEnv = require('../index')

function makeTest (t, schema, data, isOk, confExpected, errorMessage) {
  t.plan(isOk ? 2 : 1)

  const fastify = Fastify()
  fastify.register(fastifyEnv, {
    confKey: 'config',
    schema: schema,
    data: data
  })
    .ready(err => {
      if (isOk) {
        t.notOk(err)
        t.strictSame(fastify.config, confExpected)
        return
      }

      t.strictSame(err.message, errorMessage)
    })
}

const tests = [
  {
    name: 'empty ok',
    schema: { type: 'object' },
    data: { },
    isOk: true,
    confExpected: {}
  },
  {
    name: 'simple object - ok',
    schema: {
      type: 'object',
      properties: {
        PORT: {
          type: 'string'
        }
      }
    },
    data: {
      PORT: '44'
    },
    isOk: true,
    confExpected: {
      PORT: '44'
    }
  },
  {
    name: 'simple object - ok - coerce value',
    schema: {
      type: 'object',
      properties: {
        PORT: {
          type: 'integer'
        }
      }
    },
    data: {
      PORT: '44'
    },
    isOk: true,
    confExpected: {
      PORT: 44
    }
  },
  {
    name: 'simple object - ok - remove additional properties',
    schema: {
      type: 'object',
      properties: {
        PORT: {
          type: 'integer'
        }
      }
    },
    data: {
      PORT: '44',
      ANOTHER_PORT: '55'
    },
    isOk: true,
    confExpected: {
      PORT: 44
    }
  },
  {
    name: 'simple object - ok - use default',
    schema: {
      type: 'object',
      properties: {
        PORT: {
          type: 'integer',
          default: 5555
        }
      }
    },
    data: { },
    isOk: true,
    confExpected: {
      PORT: 5555
    }
  },
  {
    name: 'simple object - ok - required + default',
    schema: {
      type: 'object',
      required: [ 'PORT' ],
      properties: {
        PORT: {
          type: 'integer',
          default: 6666
        }
      }
    },
    data: { },
    isOk: true,
    confExpected: {
      PORT: 6666
    }
  },
  {
    name: 'simple object - ok - allow array',
    schema: {
      type: 'object',
      required: [ 'PORT' ],
      properties: {
        PORT: {
          type: 'integer',
          default: 6666
        }
      }
    },
    data: [{ }],
    isOk: true,
    confExpected: {
      PORT: 6666
    }
  },
  {
    name: 'simple object - ok - merge multiple object + env',
    schema: {
      type: 'object',
      required: [ 'PORT', 'MONGODB_URL' ],
      properties: {
        PORT: {
          type: 'integer',
          default: 6666
        },
        MONGODB_URL: {
          type: 'string'
        },
        VALUE_FROM_ENV: {
          type: 'string'
        }
      }
    },
    data: [ { PORT: 3333 }, { MONGODB_URL: 'mongodb://localhost/pippo' } ],
    isOk: true,
    confExpected: {
      PORT: 3333,
      MONGODB_URL: 'mongodb://localhost/pippo',
      VALUE_FROM_ENV: 'pippo'
    }
  },
  {
    name: 'simple object - ok - load only from env',
    schema: {
      type: 'object',
      required: [ 'VALUE_FROM_ENV' ],
      properties: {
        VALUE_FROM_ENV: {
          type: 'string'
        }
      }
    },
    data: undefined,
    isOk: true,
    confExpected: {
      VALUE_FROM_ENV: 'pippo'
    }
  },
  {
    name: 'simple object - KO',
    schema: {
      type: 'object',
      required: [ 'PORT' ],
      properties: {
        PORT: {
          type: 'integer'
        }
      }
    },
    data: { },
    isOk: false,
    errorMessage: 'should have required property \'PORT\''
  },
  {
    name: 'simple object - invalid data',
    schema: {
      type: 'object',
      required: [ 'PORT' ],
      properties: {
        PORT: {
          type: 'integer'
        }
      }
    },
    data: [],
    isOk: false,
    errorMessage: 'should NOT have less than 1 items,should be object,should match exactly one schema in oneOf'
  }
]

tests.forEach(function (testConf) {
  t.test(testConf.name, t => {
    makeTest(t, testConf.schema, testConf.data, testConf.isOk, testConf.confExpected, testConf.errorMessage)
  })
})
