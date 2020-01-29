import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Form, Col, Row, Modal, Container } from 'react-bootstrap';
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
          <Col sm='2'>
            <center><Form.Label as={Col}>{i}&nbsp;</Form.Label></center>
          </Col>
          <Col sm='7'>
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
            <Col sm='2'>
              <center><Alert variant='secondary'>번호</Alert></center>
            </Col>
            <Col sm='7'>
              <center><Alert variant='secondary'>정답 또는 맞는 보기 입력</Alert></center>
            </Col>
            <Col sm='3'>
              <center><Alert variant='secondary'>찍맞방지</Alert></center>
            </Col>
        </Form.Group>
        {items}
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
    this.answer = ['', '','', ''];
    this.ansNum = [0, 0, 0, 0, 0];
    this.ansbocbut = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 5; j++) {
        this.answer[i] += circleNum[this.props.answer[i * 5 + j]];
        this.ansNum[this.props.answer[i * 5 + j] - 1]++;
        this.ansbocbut.push(<>{this.props.answer[i * 5 + j]}<br/></>)
      }
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
                <Col><h5>답</h5><p>{this.answer[0]}<br/>{this.answer[1]}<br/>{this.answer[2]}<br/>{this.answer[3]}<br/></p></Col>
                <Col><h5>답개수</h5><p>{this.ansNum}<br/></p></Col>
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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {answer: ''};
    this.submitted = this.submitted.bind(this);
    this.toX = []
  }
  submitted(value, killer) {
    var erroridx = []
    var nonkiller = []
    var problemNum = []
    this.value = value;
    this.killer = killer;

    // 입력 오류 있는지 확인
    for (let i = 1; i <= 20; i++) {
      if (ansDict[value[i]] === undefined) {
        erroridx.push(i);
      }
      if (!killer.includes(i)) {
        nonkiller.push(i);
        problemNum.push(i);
      }
    }
    if (erroridx.length > 0) {
      alert(String(erroridx) + '번째 답을 양식에 맞게 입력해주세요 (예시 : 1, ㄱㄴ, x)');
      return;
    }

    value = value.map(e => ansDict[e]);

    var answer = [0, 
                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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


    nonkiller = nonkiller.filter(e => answer[e] === 0);

    this.toX = [];

    while (problemNum.length > 0) {
      if (ansNumMin.filter(e => e <= 2).length === 1 && ansNum.filter(e => e >= 6).length === 0) {
        for (let i = 0; i < 1000; i++) {
          nonkiller.sort(() => Math.random() - Math.random());
          var problem = [];
          for (let i of killer) {
            problem.push(i);
          }
          for (let i of nonkiller) {
            problem.push(i);
          }
          if (this.recursive_getAnswer(problem, value, answer, ansNum)) {
            this.toX.sort((a, b) => a - b);
            this.setState({answer: answer});
            return;
          }
        }
      }

      problemNum.sort((a, b) => {
        var ra = 0, rb = 0;
        for (let i of value[a]) {
          ra += ansNumMin[i];
        }
        for (let i of value[b]) {
          rb += ansNumMin[i];
        }
        ra /= value[a].length;
        rb /= value[b].length;
        if (ra === rb) return Math.random() - 0.5;
        else return ra - rb;
      });

      var i = problemNum.pop();

      if (!killer.includes(i) && value[i].length === 1) {
        answer[i] = 0;
        ansNum[value[i][0]]--;
        nonkiller.push(i);
      }
      for (let j of value[i]) {
        ansNumMin[j]--;
      }
      this.toX.push(i);
      value[i] = [1, 2, 3, 4, 5];
      for (let j of value[i]) {
        ansNumMin[j]++;
      }
    }
  }

  recursive_getAnswer(problem, possibleAnswer, answer, ansNum) {
    if (problem.length === 0) {
      if (!ansNum.includes(3) || ansNum.includes(2)) 
        return false;
      else return true;
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
        || (problem.length < 2 && ansNum[curAns] < 5 && ansNum[curAns] >= 3)
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
        <Output answer={this.state.answer} rerun={() => this.submitted(this.value, this.killer)} toX={this.toX}/>
      </div>
    );
  }
}

export default App;