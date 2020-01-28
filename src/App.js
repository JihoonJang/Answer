import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Col, Row, Modal } from 'react-bootstrap';
import './App.css';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: [], killer: []};
    this.onValueChanged = this.onValueChanged.bind(this);
    this.onKillerChanged = this.onKillerChanged.bind(this);
    this.onSubmitted = this.onSubmitted.bind(this);
  }
  onSubmitted(e) {
    this.props.submit(this.state.value, this.state.killer);
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
          <Col sm='1'>
            <Form.Label as={Col}>{i}&nbsp;</Form.Label>
          </Col>
          <Col sm='8'>
            <Form.Control
              required
              type='text'
              onChange={(e) => this.onValueChanged(e, i)}
              placeholder='답 또는 선지를 입력하세요. (예시 : 1, ㄱㄴ)' />
          </Col>
          <Form.Check 
            checked={this.state.killer.includes(i)} 
            onChange={(e) => this.onKillerChanged(e, i)} 
            type='checkbox' 
            label='찍맞방지' />
        </Form.Group>
      )
    }
    return (
      <Form onSubmit={this.onSubmitted}>
        {items}
        <center>
          <Button type='submit'>Submit</Button>
        </center>
      </Form>
    );
  }
}

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
}

class Output extends React.Component {
  constructor(props) {
    super(props);
    this.answer = ['', '', '', '']
    this.ansNum = [0, 0, 0, 0, 0, 0];
    this.state = {show: false, prevAns: this.props.answer};
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleShow() {
    const circleNum = [0, '①', '②', '③', '④', '⑤'];
    this.ansNum = [0, 0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 5; j++) {
        this.answer[i] += circleNum[this.props.answer[i * 5 + j]];
        this.ansNum[this.props.answer[i * 5 + j] - 1]++;
      }
    }
    this.setState({show: true});
  }

  handleClose() {
    this.answer = ['', '', '', ''];
    this.setState({show: false});
  }
  
  render() {
    if (this.state.prevAns !== this.props.answer) {
      this.setState({prevAns: this.props.answer});
      this.handleShow();
    }
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Body><h5>답</h5>{this.answer[0]}<br/>{this.answer[1]}<br/>{this.answer[2]}<br/>{this.answer[3]}<br/></Modal.Body>
        <Modal.Body><h5>답갯수</h5>{this.ansNum}<br/></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={this.handleClose}>
            Save Changes
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
  }
  submitted(value, killer) {
    var erroridx = []
    var nonkiller = []

    for (let i = 1; i <= 20; i++) {
      if (ansDict[value[i]] === undefined) {
        erroridx.push(i);
      }
      nonkiller.push(i);
    }
    if (erroridx.length > 0) {
      alert(String(erroridx) + '번째 답을 다시 입력해주세요');
      return;
    }

    value = value.map(e => ansDict[e]);

    var answer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
                  0];
    var ansNum = [0, 0, 0, 0, 0, 0];

    var ansNumMin = [0, 0, 0, 0, 0, 0];
    for (let i = 1; i <= 20; i++) {
      for (let j of value[i]) {
        ansNumMin[j]++;
      }
      if (!killer.includes(i) && value[i].length === 1) {
        answer[i] = value[i][0];
        ansNum[value[i][0]]++;
      }
    }
    var ansSeq = [1, 2, 3, 4, 5];
    for (let i = 1; i <= 5; i++) {
      if (ansNumMin[i] <= 2) {
        alert(ansSeq.filter(e => ansNumMin[e] <= 2) + '번 답갯수가 2개 이하입니다. 답을 수정하고 다시 시도해주세요.');
        return;
      }
    }
    nonkiller = nonkiller.filter(e => !killer.includes(e) && answer[e] === 0);
    nonkiller.sort(() => Math.random() - Math.random());
    
    var problem = [];
    for (let i of killer) {
      problem.push(i);
    }
    for (let i of nonkiller) {
      problem.push(i);
    }
    if (!this.recursive_getAnswer(problem, value, answer, ansNum)) {
      alert('답갯수 범위를 만족하는 결과를 찾을 수 없습니다. 답을 수정한 후 다시 시도해주세요.');
      return;
    }
  }

  recursive_getAnswer(problem, possibleAnswer, answer, ansNum) {
    if (problem.length === 0) {
      this.setState({answer: answer});
      return true;
    }
    var curProb = problem.pop();
    var randomIdx = [];
    for (let i = 0; i < possibleAnswer[curProb].length; i++) {
      randomIdx.push(i);
    }
    randomIdx.sort(() => Math.random() - Math.random());
    for (let i of randomIdx) {
      var curAns = possibleAnswer[curProb][i];
      if ((problem.length > 2 && ansNum[curAns] < 4) 
        || (problem.length < 2 && ansNum[curAns] < 5)
        || (problem.length === 2 && !ansNum.includes(1) && !(ansNum.includes(2) && ansNum[curAns] !== 2) && ansNum[curAns] < 4)) {
        answer[curProb] = curAns;
        ansNum[curAns]++;
        if (this.recursive_getAnswer(problem, possibleAnswer, answer, ansNum)) {
          return true;
        }
        answer[curProb] = 0;
        ansNum[curAns]--;
      }
    }
    problem.push(curProb);
    return false;
  }

  render() {
    return (
      <div className="App">
        <Input submit={this.submitted}/>
        <Output answer={this.state.answer}/>
      </div>
    );
  }
}

export default App;
