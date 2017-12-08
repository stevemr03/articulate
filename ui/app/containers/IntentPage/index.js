import ActionButton from 'components/ActionButton';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
import Form from 'components/Form';
import FormTextInput from 'components/FormTextInput';
import Header from 'components/Header';
import InputLabel from 'components/InputLabel';
import Table from 'components/Table';
import TableContainer from 'components/TableContainer';
import TableHeader from 'components/TableHeader';
import Toggle from 'components/Toggle';

import {
  createIntent,
  loadAgentDomains,
  loadAgentEntities,
  loadAgents,
} from 'containers/App/actions';
import {
  makeSelectAgentDomains,
  makeSelectAgentEntities,
  makeSelectAgents,
  makeSelectCurrentAgent,
  makeSelectCurrentDomain,
  makeSelectError,
  makeSelectIntent,
  makeSelectLoading,
  makeSelectScenario,
} from 'containers/App/selectors';
import React from 'react';
import Helmet from 'react-helmet';

import {
  Input,
  Row,
} from 'react-materialize';
import { connect } from 'react-redux';

import { createStructuredSelector } from 'reselect';

import {
  addTextPrompt,
  changeIntentData,
  changeSlotName,
  deleteTextPrompt,
  tagEntity,
  toggleFlag,
} from './actions';
import AvailableSlots from './Components/AvailableSlots';
import Responses from './Components/Responses';
import Slots from './Components/Slots';
import UserSayings from './Components/UserSayings';

import messages from './messages';
import {
  makeSelectIntentData,
  makeSelectScenarioData,
} from './selectors';

const returnFormattedOptions = (options) => options.map((option, index) => (
  <option key={index} value={option.value}>
    {option.text}
  </option>
    ));

const colorArray = ['#f44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A'];
const dirOfColors = {};

export class IntentPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.onComponentMounting();
  }

  render() {
    const { loading, error, intent, scenario, agents, agentDomains, agentEntities, currentAgent, currentDomain } = this.props;
    const intentProps = {
      loading,
      error,
      intent,
    };

    let agentsSelect = [];
    if (agents !== false) {
      agentsSelect = agents.map((agent) => ({
        value: `${agent.id}~${agent.agentName}`,
        text: agent.agentName,
      }));
      agentsSelect.unshift({ value: 'default', text: 'Please choose an agent to place your intent', disabled: 'disabled' });
    }

    let domainsSelect = [];
    if (agentDomains !== false) {
      domainsSelect = agentDomains.map((domain) => ({
        value: `${domain.id}~${domain.domainName}`,
        text: domain.domainName,
      }));
      domainsSelect.unshift({ value: 'default', text: 'Please choose a domain to place your intent', disabled: 'disabled' });
    }

    return (

      <div>
        <Helmet
          title="Create Intent"
          meta={[
            { name: 'description', content: 'Create an intent' },
          ]}
        />
        <Header />
        <Content>
          <ContentHeader title={messages.createIntentTitle} subTitle={messages.createIntentDescription} />
          <Form>
            <Row>
              <Toggle label="Webhook" right onChange={this.props.onChangeIntentData.bind(null, 'useWebhook')} />
            </Row>
            <Row>
              <Input
                s={12}
                name="agent"
                type="select"
                label={messages.agent.defaultMessage}
                defaultValue={this.props.intentData.agent ? this.props.intentData.agent : 'default'}
                onChange={this.props.onChangeIntentData.bind(null, 'agent')}
              >
                {returnFormattedOptions(agentsSelect)}
              </Input>
              <Input
                s={12}
                name="domain"
                type="select"
                label={messages.domain.defaultMessage}
                defaultValue={this.props.intentData.domain ? this.props.intentData.domain : 'default'}
                onChange={this.props.onChangeIntentData.bind(null, 'domain')}
              >
                {returnFormattedOptions(domainsSelect)}
              </Input>
              <FormTextInput
                label={messages.intentName}
                placeholder={messages.intentNamePlaceholder.defaultMessage}
                inputId="intentName"
                value={this.props.intentData.intentName}
                onChange={this.props.onChangeIntentData.bind(null, 'intentName')}
                required
              />
              <FormTextInput
                label={messages.userSaysTitle}
                placeholder={messages.userSaysInput.defaultMessage}
                inputId="userSays"
                onKeyPress={this.props.onChangeIntentData.bind(null, 'examples')}
                s={8}
              />
              <FormTextInput
                placeholder={messages.userSaysSearch.defaultMessage}
                inputId="userSays"
                s={4}
              />
            </Row>
          </Form>

          {this.props.intentData.examples.length > 0 ?
            <TableContainer id="userSayingsTable" quotes>
              <Table>
                <UserSayings examples={this.props.intentData.examples} onRemoveExample={this.props.onRemoveExample} onTagEntity={this.props.onTagEntity} agentEntities={agentEntities} colorArray={colorArray} dirOfColors={dirOfColors} />
              </Table>
            </TableContainer>
            : null
          }

          <Form style={{ marginTop: '0px' }}>
            <Row>
              <InputLabel text={messages.slots} />
            </Row>
          </Form>

          <TableContainer id="slotsTable">
            <Table>
              <TableHeader
                columns={[
                  {
                    width: '20%',
                    label: messages.slotNameTitle.defaultMessage,
                    tooltip: messages.slotNameTooltip.defaultMessage,
                  },
                  {
                    width: '15%',
                    label: messages.slotEntityTitle.defaultMessage,
                    tooltip: messages.slotEntityTitle.defaultMessage,
                  },
                  {
                    width: '10%',
                    label: messages.slotIsListTitle.defaultMessage,
                    tooltip: messages.slotIsListTitle.defaultMessage,
                  },
                  {
                    width: '15%',
                    label: messages.slotIsRequiredTitle.defaultMessage,
                    tooltip: messages.slotIsRequiredTitle.defaultMessage,
                  },
                  {
                    width: '40%',
                    label: messages.slotPromptTitle.defaultMessage,
                    tooltip: messages.slotPromptTitle.defaultMessage,
                  },
                ]}
              />
              <Slots
                slots={this.props.scenarioData.slots}
                onCheckboxChange={this.props.onCheckboxChange}
                onAddTextPrompt={this.props.onAddTextPrompt}
                onDeleteTextPrompt={this.props.onDeleteTextPrompt}
                onSlotNameChange={this.props.onSlotNameChange}
                onAddSlot={this.props.onAddSlot}
                agentEntities={agentEntities}
                colorArray={colorArray}
                dirOfColors={dirOfColors}
              />
            </Table>
          </TableContainer>

          <Form>
            <Row>
              <AvailableSlots
                slots={this.props.scenarioData.slots}
                agentEntities={agentEntities}
                onClickFunction={this.props.onAutoCompleteEntityFunction}
                colorArray={colorArray}
                dirOfColors={dirOfColors}
              />
              <FormTextInput
                label={messages.agentResponsesTitle}
                placeholder={messages.responsesInput.defaultMessage}
                id="responses"
                onKeyPress={this.props.onChangeIntentData.bind(null, 'responses')}
              />
            </Row>
          </Form>

          {this.props.scenarioData.intentResponses.length > 0 ?
            <TableContainer id="intentResponsesTable" quotes>
              <Table>
                <Responses intentResponses={this.props.scenarioData.intentResponses} onRemoveResponse={this.props.onRemoveExample} />
              </Table>
            </TableContainer>
            : null
          }

          {
            this.props.scenarioData.useWebhook ?
              <Form style={{ marginTop: '0px' }}>
                <Row>
                  <FormTextInput
                    label={messages.webhook}
                    placeholder={messages.webhookPlaceholder.defaultMessage}
                    inputId="webhookUrl"
                    value={this.props.scenarioData.webhookUrl}
                    onChange={this.props.onChangeIntentData.bind(null, 'webhookUrl')}
                    required
                  />
                </Row>
              </Form>
              : null
          }

          <ActionButton label={messages.actionButton} onClick={this.props.onSubmitForm} />

          <Row>
            <p>
              Intent Data
            </p>
            <p>
              {
                JSON.stringify(intentProps)
              }
            </p>
          </Row>

          <Row>
            <p>
              Scenario Data
            </p>
            <p>
              {
                scenario ? JSON.stringify(scenario) : null
              }
            </p>
          </Row>
        </Content>
      </div>
    );
  }
}

IntentPage.propTypes = {
  loading: React.PropTypes.bool,
  error: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  intent: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  scenario: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  onComponentMounting: React.PropTypes.func,
  onChangeIntentData: React.PropTypes.func,
  onSubmitForm: React.PropTypes.func,
  onTagEntity: React.PropTypes.func,
  onAutoCompleteEntityFunction: React.PropTypes.func,
  onSubmitForm: React.PropTypes.func,
  onCheckboxChange: React.PropTypes.func,
  onSlotNameChange: React.PropTypes.func,
  onAddTextPrompt: React.PropTypes.func,
  onDeleteTextPrompt: React.PropTypes.func,
  onAddSlot: React.PropTypes.func,
  intentData: React.PropTypes.object,
  currentAgent: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  agents: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  currentDomain: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.bool,
  ]),
  agentDomains: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
  agentEntities: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.bool,
  ]),
};

export function mapDispatchToProps(dispatch) {
  return {
    onComponentMounting: (evt) => {
      dispatch(loadAgents());
    },
    onChangeIntentData: (field, evt) => {
      if (field === 'examples' || field === 'responses') {
        if (evt.charCode === 13) { // If user hits enter add response
          dispatch(changeIntentData({ value: evt.target.value, field }));
          evt.target.value = null;
        }
        if (field === 'responses') {
          if (evt.charCode === 123) { // If user hits '{' display a menu with current slots
            const dropDownButton = document.getElementById('intentResponseEntityDropdown');
            dropDownButton.dispatchEvent(new Event('click'));
          }
        }
      } else {
        if (field === 'agent') {
          dispatch(loadAgentDomains(evt.target.value));
          dispatch(loadAgentEntities(evt.target.value));
          dispatch(changeIntentData({ value: evt.target.value, field }));
        }
        if (field === 'useWebhook') {
          dispatch(changeIntentData({ value: evt.target.checked, field }));
        } else {
          dispatch(changeIntentData({ value: evt.target.value, field }));
        }
      }
    },
    onRemoveExample: (exampleIndex, evt) => {

    },
    onRemoveResponse: (exampleIndex, evt) => {

    },
    onAddSlot: (evt) => {

    },
    onTagEntity: (userSays, entity, entityName, evt) => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      const userSelection = window.getSelection();
      const selectedText = userSelection.toString();
      if (selectedText !== '') {
        const start = userSays.indexOf(selectedText);
        const end = start + selectedText.length;
        const value = userSays.substring(start, end);
        dispatch(tagEntity({ userSays, entity, entityName, value, end, start }));
      }
    },
    onCheckboxChange: (slotName, field, evt) => {
      dispatch(toggleFlag({ slotName, field, value: evt.target.checked }));
    },
    onSlotNameChange: (slotName, evt) => {
      dispatch(changeSlotName({ slotName, value: evt.target.value }));
    },
    onAddTextPrompt: (slotName, evt) => {
      if (evt.charCode === 13) {
        dispatch(addTextPrompt({ slotName, value: evt.target.value }));
        evt.target.value = null;
      }
    },
    onDeleteTextPrompt: (slotName, textPrompt, evt) => {
      dispatch(deleteTextPrompt({ slotName, textPrompt }));
    },
    onAutoCompleteEntityFunction: (entityName, evt) => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      document.getElementById('responses').value += `${entityName}}`;
    },
    onSubmitForm: (evt) => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(createIntent());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  intent: makeSelectIntent(),
  scenario: makeSelectScenario(),
  intentData: makeSelectIntentData(),
  scenarioData: makeSelectScenarioData(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
  agents: makeSelectAgents(),
  agentDomains: makeSelectAgentDomains(),
  agentEntities: makeSelectAgentEntities(),
  currentAgent: makeSelectCurrentAgent(),
  currentDomain: makeSelectCurrentDomain(),
});

export default connect(mapStateToProps, mapDispatchToProps)(IntentPage);
