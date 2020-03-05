import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Button, Form, Col, Row, Modal, Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './App.css';
import exportExcel from './exportExcel';

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: [], killer: [], fileName: ''};
    this.onValueChanged = this.onValueChanged.bind(this);
    this.onKillerChanged = this.onKillerChanged.bind(this);
    this.onSubmitted = this.onSubmitted.bind(this);
    this.onFileNameChanged = this.onFileNameChanged.bind(this);
  }
  onFileNameChanged(e) {
    this.setState({fileName: e.target.value});
  }
  onSubmitted(e) {
    let killer = [...this.state.killer];
    
    // 입력 오류 있는지 확인
    let erroridx = []
    let value = [...this.state.value];

    for (let i = 1; i <= 20; i++) {
      
      value[i] = value[i].split('').sort((a, b) => {if (a === 'ㄱ') return -1; else if (a === 'ㄴ' && b === 'ㄷ') return -1; else return 1;}).join('');
      if (ansDict[value[i]] === undefined) {
        erroridx.push(i);
        value[i] = '';
      }
    }
    if (erroridx.length > 0) {
      alert(String(erroridx) + '번째 답을 양식에 맞게 입력해주세요 (예시 : 1, ㄱㄴ)');
      this.setState({value: value});
      e.preventDefault();
      return;
    }

    this.props.submit(value, killer, this.state.fileName.length > 0 ? this.state.fileName : '답안');

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
            <center><Form.Label variant='primary' size='sm'>{i}&nbsp;</Form.Label></center>
          </Col>
          <Col sm='6'>
            <Form.Control
              required
              type='text'
              onChange={(e) => this.onValueChanged(e, i)}
              placeholder='예시 : 1, ㄱㄴ, x' 
              value={this.state.value[i]}/>
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
          <Col sm='4'>
            <center><Alert variant='secondary'>시험지 이름</Alert></center>
          </Col>
          <Col sm='8'>
            <Form.Control
              type='text'
              onChange={this.onFileNameChanged}
              placeholder='예시 : 블루 3회'
              value={this.state.fileName}/>
          </Col>
        </Form.Group>
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
        
        <center>
          <Button type='submit'>Submit</Button>
        </center>
      </Form>
    );
  }
}

const circleNum = [0, '①', '②', '③', '④', '⑤'];

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

  onCopyForMacro() {
    if (navigator.clipboard === undefined) {
      alert('클립보드에 접근할 수 없습니다.');
      return;
    }
    let ret = ''
    for (let p = 1; p <= 20; p++) {
      if (this.props.answerExample[p].search("답") === -1)
        ret += '@' + p + '.' + this.props.answerExample[p] + "." + circleNum[this.props.answer[p]];
    }
    navigator.clipboard.writeText(ret.substr(1));
  }

  onCopy(p) {
    if (navigator.clipboard === undefined) {
      alert('클립보드에 접근할 수 없습니다.');
      return;
    }
    navigator.clipboard.writeText(this.props.answerExample[p]);
  }

  handleShow() {
    this.answer = [];
    this.ansNum = [0, 0, 0, 0, 0];
    this.ansbocbut = [];
    this.answerExample = [];
    this.problem = []
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j <= 5; j++) {
        let prob = i * 5 + j;
        var ans = this.props.answer[prob];
        this.answer.push(<font>{circleNum[ans]}</font>);
        this.ansNum[this.props.answer[prob] - 1]++;
        this.ansbocbut.push(<>{this.props.answer[prob]}<br/></>)
        this.answerExample.push(
        <Row>
          <Col sm='2'>
            <OverlayTrigger
              placement='left'
              delay={{ show: 250, hide: 400}}
              overlay={props => <Tooltip {...props}>클립보드에 복사하기</Tooltip>}>
              <Button size='sm' 
                disabled={this.props.answerExample[prob].search('답') === 0}
                onClick={(e) => this.onCopy(prob)}>{prob}</Button>
            </OverlayTrigger>
          </Col>
          <Col sm='10'>
            <p align='left'>
              <font>
                {this.props.answerExample[prob]}
              </font>
            </p>
          </Col>
        </Row>);
        this.problem.push(<>{prob}<br/></>);
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
    let killerAns = [1, 2, 3, 4, 5].filter(v => this.props.lb[v] > 3);
    let killerAnsStr = "";
    if (killerAns.length > 0) {
      killerAnsStr = circleNum[killerAns[0]];
      if (killerAns.length > 1) {
        killerAnsStr += ", " + circleNum[killerAns[1]];
      }
    }
    return (
      <Modal show={this.state.show} onHide={this.handleClose} dialogClassName='modal-90w'>
        <Modal.Body>
          <Container>
          <div className='Modal'>
            <Row>
              {this.props.reqMov > 0 ? 
              <Col>
                <br/>
                <Alert variant='danger'>답개수 법칙을 만족하도록 답을 지정할 수 없습니다.<br/>최소 {this.props.reqMov}문항의 답을 수정해야 합니다.
                  {killerAns.length > 0 ? 
                    <><br/><br/>※ 찍맞방지를 위해서 {killerAnsStr}의 답개수가 {killerAns.length > 1 ? "각각 " : ""}{this.props.lb[killerAns[0]]}개 이상이도록 수정해야 합니다.</>
                    : null
                  }
                </Alert>
              </Col> : null}
            </Row>
            <Row>
              <Col sm='3'>
                <h5>답</h5><p>{this.answer}</p><br/>
                <h5>답개수</h5><p>{String(this.ansNum)}</p><br/>
              </Col>
              <Col sm='9'>
                <h5>답 예시</h5>
                {this.answerExample}
              </Col>
            </Row>
          </div>
          </Container>
        </Modal.Body>
      
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            닫기
          </Button>
          <Button variant="success" onClick={e => exportExcel(this.props.fileName, this.props.input, this.props.answer, this.props.answerExample)}>
            내보내기
          </Button>
          <Button variant="primary" onClick={e => this.onCopyForMacro()}>
            답 전체 복사 (매크로용)
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
};

const answerSheet =  
  [ 
    [null, 'ㄱ', 'ㄴ', 'ㄷ', 'ㄱㄴ', 'ㄱㄷ'],
    [null, 'ㄱ', 'ㄴ', 'ㄷ', 'ㄱㄴ', 'ㄴㄷ'],
    [null, 'ㄱ', 'ㄴ', 'ㄷ', 'ㄱㄷ', 'ㄴㄷ'],
    [null, 'ㄱ', 'ㄴ', 'ㄱㄴ', 'ㄱㄷ', 'ㄴㄷ'],
    [null, 'ㄱ', 'ㄷ', 'ㄱㄴ', 'ㄱㄷ', 'ㄴㄷ'],
    [null, 'ㄴ', 'ㄷ', 'ㄱㄴ', 'ㄱㄷ', 'ㄴㄷ'],
    [null, 'ㄱ', 'ㄴ', 'ㄱㄷ', 'ㄴㄷ', 'ㄱㄴㄷ'],
    [null, 'ㄱ', 'ㄷ', 'ㄱㄴ', 'ㄴㄷ', 'ㄱㄴㄷ'],
    [null, 'ㄴ', 'ㄷ', 'ㄱㄴ', 'ㄱㄷ', 'ㄱㄴㄷ']
  ];

const bogiAnsToAnsSheet = {
  'ㄱ1':      [17,  4,  3,  4,  8,  0,  6,  9,  0], 
  'ㄴ1':      [ 0,  0,  0,  0,  0,  1,  0,  0,  1],
  'ㄴ2':      [ 0, 21,  5,  7,  0,  0,  8,  0,  0],
  'ㄷ2':      [ 0,  0,  0,  0,  4,  0,  0,  4,  1],
  'ㄷ3':      [ 0,  3,  1,  0,  0,  0,  0,  0,  0],
  'ㄱㄴ3':    [ 0,  0,  0,  4,  2,  0,  0, 24,  0],
  'ㄱㄴ4':    [ 2,  8,  0,  0,  0,  0,  0,  0,  0],
  'ㄱㄷ3':    [ 0,  0,  0,  0,  0,  0, 19,  0,  0],
  'ㄱㄷ4':    [ 0,  0,  9,  2,  8,  2,  0,  0,  2],
  'ㄱㄷ5':    [ 4,  0,  0,  0,  0,  0,  0,  0,  0],
  'ㄴㄷ4':    [ 0,  0,  0,  0,  0,  0,  9, 10,  0],
  'ㄴㄷ5':    [ 0, 11,  6,  1,  1,  1,  0,  0,  0],
  'ㄱㄴㄷ5':  [ 0,  0,  0,  0,  0,  0, 16, 23,  2],
};

const bogiToAns = {
  'ㄱ': [],
  'ㄴ': [],
  'ㄷ': [],
  'ㄱㄴ': [],
  'ㄱㄷ': [],
  'ㄴㄷ': [],
  'ㄱㄴㄷ': []
};

function getRandomAnswerExample(bogi, answer) {
  let possAccum = [];
  let possSum;
  if (bogi === 'x') {
    let xnPossArr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let key of Object.keys(bogiAnsToAnsSheet)) {
      if (key.search(answer) >= 0) {
        let possArr = bogiAnsToAnsSheet[key];
        xnPossArr = xnPossArr.map((v, i) => v + possArr[i]);
      }
    }
    for (let i = 0; i < answerSheet.length; i++) {
      possAccum.push(i === 0 ? xnPossArr[i] : xnPossArr[i] + possAccum[i - 1]);
    }
    possSum = xnPossArr.reduce((p, c) => p + c, 0);
  }
  else if (bogi + answer in bogiAnsToAnsSheet) {
    let possArr = bogiAnsToAnsSheet[bogi + answer];
    for (let i = 0; i < answerSheet.length; i++) {
      possAccum.push(i === 0 ? possArr[i] : possArr[i] + possAccum[i - 1]);
    }
    possSum = possArr.reduce((p, c) => p + c, 0);
  }
  else return '답 확정 (' + circleNum[answer] + ')';

  let poss = Math.random() * possSum;

  for (let i = 0; i < answerSheet.length; i++) {
    if (poss <= possAccum[i]) {
      return answerSheet[i];
    }
  }
  return 'error';
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {answer: ''};
    this.submitted = this.submitted.bind(this);
    this.lb = [0, 3, 3, 3, 3, 3];
    this.reqMov = 0;
  }

  submitted(value, killer, fileName) {
    this.value = [...value];
    this.killer = [...killer];
    this.fileName = fileName;

    // input을 가능한 답의 집합으로 mapping시킴
    let answerSet = value.map(e => ansDict[e]);
    
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
      constructor(arraymap = null) {
        if (arraymap != null) this._map = new Map(arraymap._map);
        else this._map = new Map()
      }
      get(arr) {
        return this._map.get(arr.reduce((p, c) => p + c * (10 ** c), 0));
      }
      set(arr, val) {
        this._map.set(arr.reduce((p, c) => p + c * (10 ** c), 0), val);
      }
    };

    var totalAnsNumDict = new ArrayMap();
    var upperBoundDict = new ArrayMap();
    var lowerBoundDict = new ArrayMap();
    
    var isValid = (ansNumLowerBound = null, ansNumUpperBound = null) => {
      if (ansNumLowerBound === null) ansNumLowerBound = [0, 3, 3, 3, 3, 3];
      if (ansNumUpperBound === null) ansNumUpperBound = [0, 5, 5, 5, 5, 5];

      let problemSetOfAnswer = [0, new Set(), new Set(), new Set(), new Set(), new Set()];

      for (let p of remainProblem) {
        for (let a of answerSet[p]) {
          problemSetOfAnswer[a].add(p);
        }
      }

      Combinations.forEach(comb => {
        var unionSet = problemSetOfAnswer[comb[0]];
        for (let i = 1; i < comb.length; i++) {
          unionSet = new Set([...unionSet, ...problemSetOfAnswer[comb[i]]]);
        }
        var totalAnsNum = unionSet.size;
        for (let a of comb) {
          totalAnsNum += ansNum[a];
        };

        totalAnsNumDict.set(comb, totalAnsNum);
        lowerBoundDict.set(comb, comb.reduce((p, c) => p + ansNumLowerBound[c], 0));
        upperBoundDict.set(comb, 20 - [1, 2, 3, 4, 5].filter(v => !comb.includes(v)).reduce((p, c) => p + ansNumUpperBound[c], 0));
      });

      for (let c of Combinations) {
        if (totalAnsNumDict.get(c) < lowerBoundDict.get(c) || 
            totalAnsNumDict.get(c) < upperBoundDict.get(c)) return false;
      }
      return true;
    }

    var recursive_fillAnswer = (ansNumLowerBound = null, ansNumUpperBound = null) => {
      if (!isValid(ansNumLowerBound, ansNumUpperBound)) return false;
      
      if (remainProblem.length === 0) {
        this.answerExample = {};
        this.modifiedValue= [null];
        for (let p = 1; p <= 20; p++) {
          let answerBogi = getRandomAnswerExample(value[p], ans[p]);
          if (!['1', '2', '3', '4', '5'].includes(value[p])) {
            let s = '';
            for (let a = 1; a <= 5; a++) {
              s += circleNum[a] + ' ';
              for (let bogi of answerBogi[a]) {
                s += bogi + ', ';
              }
              s = s.substr(0, s.length - 2) + '\t';
            }
            this.answerExample[p] = s.substr(0, s.length - 1);
            if (value[p] === 'x') {
              this.modifiedValue.push(answerBogi[ans[p]]);
            }
            else this.modifiedValue.push(value[p]);
          }
          else {
            this.answerExample[p] = answerBogi;
            this.modifiedValue.push(value[p]);
          }
        }
        this.setState({answer: ans});
        return true;
      }

      const p = remainProblem.pop();
      answerSet[p].sort(() => Math.random() - Math.random());
      for (let a of answerSet[p]) {
        ansNum[a]++;
        ans[p] = a;
        if (recursive_fillAnswer(ansNumLowerBound, ansNumUpperBound)) return true;
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
        for (let a of answerSet[killer[0]]) killerAnsArr.push([a]);
        break;
      case 2:
        for (let a0 of answerSet[killer[0]]) {
          for (let a1 of answerSet[killer[1]]) {
            killerAnsArr.push([a0, a1]);
          }
        }
        break;
      default: break;
    }
    killerAnsArr.sort(() => Math.random() - Math.random());  
    let minRequiredMoving = 20;
    let minKillerAns;

    
    var getMinMovingComb = (lb, ub) => {
      isValid(lb, ub);
      let requiredMoving = 0, minComb = null;
      for (let comb of Combinations) {
        let maxBound = upperBoundDict.get(comb) > lowerBoundDict.get(comb) ? upperBoundDict.get(comb) : lowerBoundDict.get(comb);
        if (requiredMoving < maxBound - totalAnsNumDict.get(comb)) {
          requiredMoving = maxBound - totalAnsNumDict.get(comb);
          minComb = comb;
        }
      }          
      return [requiredMoving, minComb];
    }  


    for (let killerAns of killerAnsArr) {
      let lowerBound = [0, 3, 3, 3, 3, 3];
      let upperBound = [0, 5, 5, 5, 5, 5];
      for (let i = 0; i < killer.length; i++) {
        ans[killer[i]] = killerAns[i];
        ansNum[killerAns[i]]++;
        lowerBound[killerAns[i]]++;
      }
      if (recursive_fillAnswer(lowerBound, upperBound)) return;
      else {      
        let requiredMoving, minComb;

        [requiredMoving, minComb] = getMinMovingComb(lowerBound, upperBound);

        if (minRequiredMoving > requiredMoving) {
          minRequiredMoving = requiredMoving;
          
          minKillerAns = killerAns;
        }
      }

      for (let i = 0; i < killer.length; i++) {
        ans[killer[i]] = 0;
        ansNum[killerAns[i]]--;
      }
    }
    // bound 수정

    let lb = [0, 3, 3, 3, 3, 3], ub = [0, 5, 5, 5, 5, 5];

    for (let i = 0; i < killer.length; i++) {
      ans[killer[i]] = minKillerAns[i];
      ansNum[minKillerAns[i]]++;
      lb[minKillerAns[i]]++;
    }

    let cur_reqMov, new_reqMov, comb;

    [cur_reqMov, comb] = getMinMovingComb(lb, ub);

    // Output 전달용
    this.reqMov = cur_reqMov;
    this.lb = [...lb];

    outloop : while (cur_reqMov > 0) {
      let comb_excl = [1, 2, 3, 4, 5].filter(v => !comb.includes(v));
      comb.sort(() => Math.random() - Math.random());
      comb_excl.sort(() => Math.random() - Math.random());

      var lack = [...comb], excessive = [...comb_excl];
      // lack의 lb는 줄이고, excessive의 ub는 늘려야 함
      for (let lack_elem of lack) {
        lb[lack_elem]--;
        [new_reqMov, comb] = getMinMovingComb(lb, ub);
        if (new_reqMov < cur_reqMov) {
          cur_reqMov = new_reqMov;
          continue outloop;
        }
        lb[lack_elem]++;
      }
      for (let excessive_elem of excessive) {
        ub[excessive_elem]++;
        [new_reqMov, comb] = getMinMovingComb(lb, ub);
        if (new_reqMov < cur_reqMov) {
          cur_reqMov = new_reqMov;
          continue outloop;
        }
        ub[excessive_elem]--;
      }
      for (let lack_elem of lack) {
        lb[lack_elem]--;
        for (let excessive_elem of excessive) {
          ub[excessive_elem]++;
          [new_reqMov, comb] = getMinMovingComb(lb, ub);
          if (new_reqMov < cur_reqMov) {
            cur_reqMov = new_reqMov;
            continue outloop;
          }
          ub[excessive_elem]--;
        }
        lb[lack_elem]++;
      }
    }
    
    if (recursive_fillAnswer(lb, ub)) {
      return;
    }
    alert('error');
  }

  render() {
    return (
      <div className="App">
        <Input submit={this.submitted}/>
        <Output 
          input={this.modifiedValue}
          fileName={this.fileName}
          answer={this.state.answer} 
          answerExample={this.answerExample}
          rerun={() => this.submitted(this.value, this.killer, this.lowerBoundInput, this.fileName)}
          reqMov={this.reqMov}
          lb={this.lb} 
        />
      </div>
    );
  }
}

export default App;
