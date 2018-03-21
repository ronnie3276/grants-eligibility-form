import React, { Component } from 'react';
import propTypes from 'prop-types';
import Parser from 'html-react-parser';

// Import all of our template variants
import q1 from './templates/q1.html';
import q2 from './templates/q2.html';
import q3 from './templates/q3.html';
import q4 from './templates/q4.html';
import q5 from './templates/q5.html';
import q6 from './templates/q6.html';
import q7 from './templates/q7.html';
import q8 from './templates/q8.html';
import q9 from './templates/q9.html';

/**
 * Question class
 */
class Question extends Component {
  /* Helper function to help contain messy message logic */
  static messageSwitch(currentQuestionType, value, coreCosts, over100k) {
    switch (currentQuestionType) {
      case 'sports-project':
        if (coreCosts === 'no') { return '6'; } else if (coreCosts === 'yes') { return (over100k === 'yes' ? '4' : '5'); }
        break;

      case 'project-location':
        if (value === 'other') {
          if (coreCosts === 'no') { return '7'; } else if (coreCosts === 'yes') { return (over100k === 'yes' ? '8' : '9'); }
        } else if (value === 'india') {
          if (coreCosts === 'no') { return '10'; } else if (coreCosts === 'yes') { return (over100k === 'yes' ? '11' : '12'); }
        } break;

      case 'london':
        if (value === 'no') {
          if (coreCosts === 'no') { return '10'; } else if (coreCosts === 'yes') { return (over100k === 'yes' ? '11' : '12'); }
        } else if (value === 'yes') {
          if (coreCosts === 'no') { return '13'; } else if (coreCosts === 'yes') { return (over100k === 'yes' ? '14' : '15'); }
        } break;

      default:
        console.log('default');
    }
    return null;
  }
  /**
   * Question constructor
   * @param props
   */
  constructor(props) {
    super(props);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.submitAnswer = this.submitAnswer.bind(this);

    this.state = {
      currentQuestion: 1,
      responses: {},
    };
  }

  componentDidMount() {
    this.updateQuestionNumber();
  }

  componentDidUpdate() {
    this.updateQuestionNumber();
  }

  /* Update the state to reflect our input field */
  handleTextChange(event) {
    const stateCopy = Object.assign({}, this.state);
    stateCopy.responses.company_name = event.target.value;
    this.setState(stateCopy);
  }

  /* Update the state to reflect our current question */
  updateQuestionNumber() {
    const currUrlQ = parseInt(this.props.match.params.question_number, 10);
    if (this.state.currentQuestion !== currUrlQ) {
      this.setState({ currentQuestion: currUrlQ });
    }
  }

  /* Handles 'submission' of the company input question */
  handleSubmit(event) {
    event.preventDefault();
    /* Create path to next question */
    const nextQuestion = parseInt(this.state.currentQuestion, 10) + 1;
    const newPath = '/question/' + nextQuestion;

    /* Update the URL */
    this.props.history.push({ pathname: newPath });
  }

  /* Handles submission of each question, storing the response and switching content as required */
  submitAnswer(e) {
    /* Get this response's attrs and values */
    const thisButton = e.target;
    const isRejected = thisButton.getAttribute('data-r');
    const thisValue = thisButton.getAttribute('data-v');
    const thisQuestionType = thisButton.getAttribute('data-q');

    /* Cache current question to use as array pointer */
    const thisQuestion = this.state.currentQuestion;

    /* Store the user's response to the question */
    const stateCopy = Object.assign({}, this.state);
    stateCopy.responses[thisQuestionType] = thisValue;
    this.setState(stateCopy);

    let newPath = '';

    /* If this answer still represents an eligable submission, continue the journey */
    if (isRejected === 'false') {
      newPath = '/question/' + (thisQuestion + 1);
    } else if (isRejected === 'true') {
      /* If this answer is a direct rejection, forward user
       * to the rejection page with specific variant  */
      newPath = '/outcome/' + thisButton.getAttribute('data-m');
    } else {
      /* Else, this is our "check" value, and we need to
       * check prior answers to determine the outcome */
      const theseResponses = this.state.responses;
      const messageToShow = Question.messageSwitch(thisQuestionType, thisValue, theseResponses['core-costs'], theseResponses['over-100k']);
      newPath = '/outcome/' + messageToShow;
    }

    /* Update the URL */
    this.props.history.push({
      pathname: newPath,
    });
  }

  /**
   * Render the user choices for this specific questions
   * @return {XML}
   */
  renderInput() {
    /* Access our zero-indexed question array */
    const currentInput = this.props.questions[this.state.currentQuestion - 1].text_input;

    if (currentInput !== undefined) {
      return (
        <form onSubmit={this.handleSubmit}>
          {currentInput.map(thisInput => (
            <div key={thisInput.question_type + 'wrapper'} className="field-item text-input text-align-center">
              <label htmlFor={thisInput.question_type + '-label'} key={thisInput.question_type + '-label'}>{thisInput.text}</label>
              <input
                id={thisInput.question_type + '-label'}
                placeholder={thisInput.text}
                required
                key={thisInput.question_type + '-input'}
                type="text"
                onChange={this.handleTextChange}
              />
              <input type="submit" value="Continue" />
            </div>
            ))}
        </form>
      );
    }
    return null;
  }

  /**
   * Render the user choices for this specific questions
   * @return {XML}
   */
  renderButtons() {
    /* Access our zero-indexed question array */
    const currentButtons = this.props.questions[this.state.currentQuestion - 1].buttons;

    if (currentButtons !== undefined) {
      return (
        <div className="buttons text-align-center">
          {currentButtons.map(thisButton => (
            <button
              key={thisButton.question_type}
              data-q={thisButton.question_type}
              data-v={thisButton.value}
              data-r={thisButton.reject}
              data-m={thisButton.message}
              className="grants-btn btn"
              onClick={function (e) { this.submitAnswer(e); }}
            >
              {thisButton.text}
            </button>
            ))}
        </div>
      );
    } return null;
  }

  /**
   * Render the Question
   * @return {XML}
   */
  render() {
    // Cache the current copy and user options from our zero-indexed array
    const currentQuestion = this.props.questions[this.state.currentQuestion - 1];

    return (
      <div>
        { currentQuestion.title !== undefined ?
          <header className="bg--red promo-header promo-header--default promo-header--no-image">
            <div className="promo-header__content">
              <div className="promo-header__content-inner promo-header__content-inner--centre">
                <div className="cr-body">
                  <h1 className="font--white text-align-center">
                    { Parser(currentQuestion.title) }
                  </h1>
                </div>
              </div>
            </div>
          </header> :

          <header className="bg--white promo-header promo-header--default promo-header--no-image">
            <div className="promo-header__content">
              <div className="promo-header__content-inner promo-header__content-inner--centre">
                <div className="cr-body">
                  <h5 className="font--black text-align-center">(progress bar)</h5>
                </div>
              </div>
            </div>
          </header>
      }
        <main role="main" className="bg--grey">
          <div className="content">
            <div className={'bg--grey question question-' + this.state.currentQuestion}>
              { Parser(currentQuestion.template) }
              { this.renderInput() }
              { this.renderButtons() }
            </div>
          </div>
        </main>
      </div>
    );
  }
}

/* Define proptypes */
Question.propTypes = {
  history: { push: null },
  match: null,
  questions: propTypes.arrayOf(propTypes.shape({
    title: propTypes.string,
    button_copy: propTypes.string,
    template: propTypes.string,
    text_input: propTypes.arrayOf(propTypes.shape({
      question_type: propTypes.string,
      text: propTypes.string,
      value: propTypes.string,
      reject: propTypes.string,
      message: propTypes.string,
    })),
    buttons: propTypes.arrayOf(propTypes.shape({
      question_type: propTypes.string,
      text: propTypes.string,
      value: propTypes.string,
      reject: propTypes.string,
      message: propTypes.string,
    })),
  })),
};

Question.defaultProps = {
  match: null,
  history: { push: null },
  questions: [
    {
      title: 'Get started',
      button_copy: '<p>1: What type of organisation?</p>',
      buttons: [
        {
          question_type: 'organisation-type', text: 'Individual', value: 'individual', reject: 'true', message: '1',
        },
        {
          question_type: 'organisation-type', text: 'Charity', value: 'charity', reject: 'false', message: '',
        }],
      template: q1,
    },
    {
      button_copy: '<p>2: Organisation name: 2</p>',
      text_input: [{
        question_type: 'organisation-name', text: 'Your organisation name', value: '', reject: 'false', message: '',
      }],
      template: q2,
    },
    {
      button_copy: '<p>3: What activities?</p>',
      buttons: [
        {
          question_type: 'activities-type', text: 'Religious', value: 'religious', reject: 'true', message: '2',
        },
        {
          question_type: 'activities-type', text: 'Other', value: 'other', reject: 'false', message: '',
        }],
      template: q3,
    },
    {
      button_copy: '<p>4: Only looking to cover capital costs?</p>',
      buttons: [
        {
          question_type: 'capital-costs', text: 'Yes', value: 'yes', reject: 'true', message: '3',
        },
        {
          question_type: 'capital-costs', text: 'No', value: 'no', reject: 'false', message: '',
        }],
      template: q4,
    },
    {
      button_copy: '<p>5: Core costs?</p>',
      buttons: [
        {
          question_type: 'core-costs', text: 'Yes', value: 'yes', reject: 'false', message: '',
        },
        {
          question_type: 'core-costs', text: 'No', value: 'no', reject: 'false', message: '',
        }],
      template: q5,
    },
    {
      button_copy: '<p>6: Over 100k income?</p>',
      buttons: [
        {
          question_type: 'over-100k', text: 'Yes', value: 'yes', reject: 'false', message: '',
        },
        {
          question_type: 'over-100k', text: 'No', value: 'no', reject: 'false', message: '',
        }],
      template: q6,
    },
    {
      button_copy: '<p>7: Sports project?</p>',
      buttons: [
        {
          question_type: 'sports-project', text: 'Yes', value: 'yes', reject: 'false', message: '',
        },
        {
          question_type: 'sports-project', text: 'No', value: 'no', reject: 'check', message: '',
        }],
      template: q7,
    },
    {
      button_copy: '<p>8: Project location?</p>',
      buttons: [
        {
          question_type: 'project-location', text: 'UK', value: 'uk', reject: 'false', message: '',
        },
        {
          question_type: 'project-location', text: 'India', value: 'india', reject: 'check', message: '',
        },
        {
          question_type: 'project-location', text: 'Other', value: 'other', reject: 'check', message: '',
        }],
      template: q8,
    },
    {
      button_copy: '<p>9: In London?</p>',
      buttons: [
        {
          question_type: 'london', text: 'Yes', value: 'yes', reject: 'check', message: '',
        },
        {
          question_type: 'london', text: 'No', value: 'no', reject: 'check', message: '',
        }],
      template: q9,
    },
  ],
};

export default Question;
