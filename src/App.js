import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Form, Col, Row, Modal, Container } from 'react-bootstrap';
import './App.css';

const ansDict = {
  '1': [1],
  '2': [2],
  '3': [3],
  '4': [4],
  '5': [5],
  'ㄱ': [1],
  'ㄴ': [1, 2],
  'ㄷ': [2, 3],
  'ㄱㄴ': [3, 4],
  'ㄱㄷ': [3, 4, 5],
  'ㄴㄷ': [4, 5],
  'ㄱㄴㄷ': [5],
  'x': [1, 2, 3, 4, 5]
};

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: [], killer: [], ansNum: ''};
    this.onValueChanged = this.onValueChanged.bind(this);
    this.onKillerChanged = this.onKillerChanged.bind(this);
    this.onSubmitted = this.onSubmitted.bind(this);
    this.onAnsNumChanged = this.onAnsNumChanged.bind(this);
  }
  onAnsNumChanged(e) {
    this.setState({ansNum: e.target.value});
  }
  onSubmitted(e) {
    let ansNum = null;
    let killer = [...this.state.killer];
    if (this.state.ansNum.length !== 0) {
      ansNum = [null];
      for (let a of this.state.ansNum) {
        a = parseInt(a);
        if (isNaN(a) || a > 6 || a < 2) {
          alert('답개수 지정을 양식에 맞게 다시 입력해주세요. (답개수는 각각 2부터 6까지만 가능합니다.)');
          e.preventDefault();
          return;
        }
        ansNum.push(a);
      }
      if (ansNum.length !== 6) {
        alert('답개수를 ①번부터 ⑤번까지 모두 입력해주세요.');
        e.preventDefault();
        return;
      }
      if (ansNum.reduce((p, c, i) => {if (i === 0) return 0; else return p + c}) > 20) {
        alert('답개수의 합이 20을 넘어가지 않게 입력해주세요.');
        e.preventDefault();
        return;
      }
      if (this.state.killer.length > 0) {
        alert('답개수 지정과 찍맞방지를 동시에 사용할 수 없습니다. 찍맞방지를 해제합니다.');
        killer = [];
        this.setState({killer: []});
      }
    }
    
    // 입력 오류 있는지 확인
    let erroridx = []
    let value = [...this.state.value];

    for (let i = 1; i <= 20; i++) {
      if (ansDict[value[i]] === undefined) {
        erroridx.push(i);
      }
    }
    if (erroridx.length > 0) {
      alert(String(erroridx) + '번째 답을 양식에 맞게 입력해주세요 (예시 : 1, ㄱㄴ, x)');
      e.preventDefault();
      return;
    }

    // input을 가능한 답의 집합으로 mapping시킴
    value = value.map(e => ansDict[e]);

    this.props.submit(value, killer, ansNum);

    e.preventDefault();
  }
  onValueChanged(e, num) {
    var newVal = this.state.value;
    newVal[num] = e.target.value;
    this.setState({value: newVal});
  }
  onKillerChanged(e, num) {
    var newVal = this.state.killer;
    if (newVal.includes(num)) {
      newVal = newVal.filter(e => e !== num);
    }
    else {
      if (newVal.length === 2) {
        alert('찍맞방지는 최대 2개까지만 선택 가능합니다.');
        return;
      }
      newVal.push(num);
    }
    this.setState({killer: newVal});
  }
  render() {
    const items = [];
    for (let i = 1; i <= 20; i++) {
      items.push(
        <Form.Group as={Row}>
          <Col sm='3'>
            <center><Form.Label as={Col}>{i}&nbsp;</Form.Label></center>
          </Col>
          <Col sm='6'>
            <Form.Control
              required
              type='text'
              onChange={(e) => this.onValueChanged(e, i)}
              placeholder='예시 : 1, ㄱㄴ, x' />
          </Col>
          <Col sm='3'>
            <center>
              <Form.Check 
                checked={this.state.killer.includes(i)} 
                onChange={(e) => this.onKillerChanged(e, i)} 
                type='checkbox'/>
            </center>
          </Col>
        </Form.Group>
      )
    }
    return (
      <Form onSubmit={this.onSubmitted}>
        <Form.Group as={Row}>
          <Col sm='3'>
            <center><Alert variant='secondary'>번호</Alert></center>
          </Col>
          <Col sm='6'>
            <center><Alert variant='secondary'>정답 또는 맞는 보기 입력</Alert></center>
          </Col>
          <Col sm='3'>
            <center><Alert variant='secondary'>찍맞방지</Alert></center>
          </Col>
        </Form.Group>
        {items}
        <Form.Group as={Row}>
          <Col sm='3'>
            <center>답개수 지정</center>
          </Col>
          <Col sm='6'>
            <center>
              <Form.Control
              type='text'
              onChange={this.onAnsNumChanged}
              placeholder='예시 : 35435, 25553'/>
            </center>
          </Col>
        </Form.Group>
        <center>
          <Button type='submit'>Submit</Button>
        </center>
      </Form>
    );
  }
}

class Output extends React.Component {
  constructor(props) {
    super(props);
    this.answer = ['', '', '', ''];
    this.ansNum = [0, 0, 0, 0, 0, 0];
    this.ansbocbut = [null];
    this.state = {show: false, prevAns: this.props.answer};
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleShow() {
    const circleNum = [0, '①', '②', '③', '④', '⑤'];
    this.answer = [];
    this.ansNum = [0, 0, 0, 0, 0];
    this.ansbocbut = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 5; j++) {
        var prob = i * 5 + j;
        var ans = this.props.answer[i * 5 + j];
        this.answer.push(<font style={{color: this.props.toX.includes(prob) ? 'red' : 'black'}}>{circleNum[ans]}</font>);
        this.ansNum[this.props.answer[i * 5 + j] - 1]++;
        this.ansbocbut.push(<>{this.props.answer[i * 5 + j]}<br/></>)
      }
      this.answer.push(<br/>)
    }
    this.setState({show: true});
  }

  handleClose() {
    this.setState({show: false});
  }

  
  render() {
    if (this.state.prevAns !== this.props.answer) {
      this.setState({prevAns: this.props.answer});
      this.handleShow();
    }
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Body>
          <center>
            <Container>
              <Row>
                <Col><h5>답</h5><p>{this.answer}</p></Col>
                <Col><h5>답개수</h5><p>{String(this.ansNum)}<br/></p></Col>
                <Col><h5>답 복붙용</h5><p>{this.ansbocbut}</p></Col>
              </Row>
              {this.props.toX.length > 0 ? <Row><Alert variant='danger'>{String(this.props.toX)}번의 답을 위와 같이 수정해야 합니다.</Alert></Row> : null}
            </Container>
          </center>
        </Modal.Body>
      
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={this.props.rerun}>
            Rerun
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {answer: ''};
    this.submitted = this.submitted.bind(this);
    this.toX = []
  }

  submitted(value, killer, thresholdInput) {
    this.value = [...value];
    this.killer = [...killer];
    this.thresholdInput = thresholdInput;

    // 답개수    
    var ansNum = [null, 0, 0, 0, 0, 0];
    var ans = [null];
    for (let i = 0; i < 20; i++) {
      ans.push(0);
    }

    // 킬러 제외 문제
    var remainProblem = [];

    for (let p = 1; p <= 20; p++) {
      if (!killer.includes(p)) remainProblem.push(p);
    }

    // 랜덤 sorting
    remainProblem.sort(() => Math.random() - Math.random());

    const Combinations = [
      [1], [2], [3], [4], [5], 
      [1, 2], [1, 3], [1, 4], [1, 5], [2, 3], 
      [2, 4], [2, 5], [3, 4], [3, 5], [4, 5],
      [1, 2, 3], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5],
      [1, 4, 5], [2, 3, 4], [2, 3, 5], [2, 4, 5], [3, 4, 5],
      [1, 2, 3, 4], [1, 2, 3, 5], [1, 2, 4, 5], [1, 3, 4, 5], [2, 3, 4, 5]
    ];

    class ArrayMap {
      constructor() {
        this._map = new Map();
      }
      get(arr) {
        return this._map.get(arr.reduce((p, c) => p + c * (5 ** c), 0));
      }
      set(arr, val) {
        this._map.set(arr.reduce((p, c) => p + c * (5 ** c), 0), val);
      }
    };

    var totalAnsNumDict = new ArrayMap();
    var thresholdDict = new ArrayMap();

    var isValid = (ansNumThreshold, toX = []) => {
      var problemSetOfAnswer = [0, new Set(), new Set(), new Set(), new Set(), new Set()];

      for (let p of remainProblem) {
        if (toX.includes(p)) for (let a of [1, 2, 3, 4, 5]) {
          problemSetOfAnswer[a].add(p);
        }
        else for (let a of value[p]) {
          problemSetOfAnswer[a].add(p);
        }
      }

      Combinations.forEach(val => {
        const defaultThreshold = [0, 3, 6, 10, 15];
        var unionSet = problemSetOfAnswer[val[0]];
        for (let i = 1; i < val.length; i++) {
          unionSet = new Set([...unionSet, ...problemSetOfAnswer[val[i]]]);
        }
        var totalAnsNum = unionSet.size;
        for (let a of val) {
          totalAnsNum += ansNum[a];
        };

        let threshold = 0;
        if (ansNumThreshold != null) {
          for (let a of val) threshold += ansNumThreshold[a];
          if (ansNumThreshold.reduce((p, c, i) => {if (i === 0) return 0; else return p + c;}) < 20 
            && threshold < defaultThreshold[val.length])
            threshold = defaultThreshold[val.length];
        }
        else threshold = defaultThreshold[val.length];

        totalAnsNumDict.set(val, totalAnsNum);
        thresholdDict.set(val, threshold);
      });

      for (let c of Combinations) {
        if (totalAnsNumDict.get(c) < thresholdDict.get(c)) return false;
      }
      return true;
    }

    var recursive_fillAnswer = (ansNumThreshold = null) => {
      if (!isValid(ansNumThreshold)) return false;
      
      if (remainProblem.length === 0) return true;

      const p = remainProblem.pop();
      value[p].sort(() => Math.random() - Math.random());
      for (let a of value[p]) {
        ansNum[a]++;
        ans[p] = a;
        if (recursive_fillAnswer(ansNumThreshold)) return true;
        ans[p] = 0;
        ansNum[a]--;
      }
      remainProblem.push(p);
      return false;
    }

    killer.sort(() => Math.random() - Math.random());

    var killerAnsArr = [];
    switch(killer.length) {
      case 0: killerAnsArr.push([]); break;
      case 1: 
        for (let a of value[killer[0]]) killerAnsArr.push([a]);
        break;
      case 2:
        for (let a0 of value[killer[0]]) {
          for (let a1 of value[killer[1]]) {
            killerAnsArr.push([a0, a1]);
          }
        }
        break;
      default: break;
    }
    killerAnsArr.sort(() => Math.random() - Math.random());

    var toXDict = new Map();
    for (let killerAns of killerAnsArr) {
      for (let i = 0; i < killer.length; i++) {
        ans[killer[i]] = killerAns[i];
        ansNum[killerAns[i]]++;
      }
      let threshold = thresholdInput === null ? [null, 3, 3, 3, 3, 3] : thresholdInput;
      if (thresholdInput === null)
        for (let a of killerAns) threshold[a]++;

      if (recursive_fillAnswer(threshold)) {
        this.setState({answer: ans});
        return;
      }
      else {
        var toX = [];
        var toXCandidate = remainProblem.filter(p => value[p].length < 5);
        do {
          toXCandidate.sort((a, b) => {
            a = totalAnsNumDict.get(value[a]) - thresholdDict.get(value[a]);
            b = totalAnsNumDict.get(value[b]) - thresholdDict.get(value[b]);
            if (a === b) return Math.random() - Math.random();
            else return a - b;
          });
          toX.push(toXCandidate.pop());
        } while (!isValid(threshold, toX));
        toXDict.set(killerAns, toX);
      }
      for (let i = 0; i < killer.length; i++) {
        ans[killer[i]] = 0;
        ansNum[killerAns[i]]--;
      }
    }

    var minKey = toXDict.keys().next().value;

    for (let killerAns of toXDict.keys()) {
      if (toXDict.get(minKey).length > toXDict.get(killerAns).length)
        minKey = killerAns;
    }

    this.toX = toXDict.get(minKey);
    this.toX.sort((a, b) => a - b);
    for (let p of this.toX) value[p] = [1, 2, 3, 4, 5];

    let threshold = thresholdInput === null ? [null, 3, 3, 3, 3, 3] : thresholdInput;
    if (thresholdInput === null)
      for (let a of minKey) threshold[a]++;

    for (let i = 0; i < killer.length; i++) {
      ans[killer[i]] = minKey[i];
      ansNum[minKey[i]]++;
    }
    
    if (recursive_fillAnswer(threshold)) {
      this.setState({answer: ans});
      return;
    }

    
  }

  render() {
    return (
      <div className="App">
        <Input submit={this.submitted}/>
        <Output answer={this.state.answer} rerun={() => this.submitted(this.value, this.killer, this.thresholdInput)} toX={this.toX}/>
      </div>
    );
  }
}

export default App;