const { getVersionById } = require('./get-version-by-id')

test('get latest if no version provided', () => {
  const input = [
    {
      id: 'v2.0.2',
      date: '2019-12-08',
      text: `blablabla`
    },
    {
      id: 'v2.0.1',
      date: '2019-12-02',
      text: `blablabla`
    }
  ]
  const output = getVersionById(input)

  expect(output.id).toEqual(input[0].id)
})

test('get latest if bad version provided', () => {
  const input = [
    {
      id: 'v2.0.2',
      date: '2019-12-08',
      text: `blablabla`
    },
    {
      id: 'v2.0.1',
      date: '2019-12-02',
      text: `blablabla`
    }
  ]
  const output = getVersionById(input, 'v1.2.12')

  expect(output.id).toEqual(input[0].id)
})

test('support X.X.X version patern', () => {
  const input = [
    {
      id: 'v2.0.2',
      date: '2019-12-08',
      text: `blablabla`
    },
    {
      id: '2.0.1',
      date: '2019-12-02',
      text: `blablabla`
    },
    {
      id: '1.13.2',
      date: '2019-12-02',
      text: `blablabla`
    }
  ]
  const output = getVersionById(input, '2.0.1')

  expect(output.id).toEqual('2.0.1')
})

test('get the correct version', () => {
  const input = [
    {
      id: 'v2.1.1',
      date: '2019-12-08',
      text: `blablabla`
    },
    {
      id: 'v2.1.0',
      date: '2019-12-02',
      text: `blablabla`
    },
    {
      id: 'v2.0.0',
      date: '2019-12-02',
      text: `blablabla`
    },
    {
      id: 'v1.2.12',
      date: '2019-12-02',
      text: `blablabla`
    },
  ]
  const output = getVersionById(input, 'v2.1.0')

  expect(output.id).toEqual(input[1].id)
})
