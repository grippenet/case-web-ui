import React, { useState, useEffect } from 'react';
import { isItemGroupComponent, ItemComponent, ItemGroupComponent, ResponseItem } from 'survey-engine/data_types';
import { renderFormattedContent } from '../../renderUtils';
import MarkdownComponent from '../../SurveyComponents/MarkdownComponent';
import TextViewComponent from '../../SurveyComponents/TextViewComponent';
import { CommonResponseComponentProps, getClassName } from '../../utils';
import DateInput from '../DateInput/DateInput';
import DropDownGroup from './DropDownGroup';
import NumberInput from './NumberInput';
import TextInput from './TextInput';
import Time from './Time';

interface ClozeQuestionProps extends CommonResponseComponentProps {

}

const defaultInputClassName = "mx-1 my-0a";

const ClozeQuestion: React.FC<ClozeQuestionProps> = (props) => {
  const [response, setResponse] = useState<ResponseItem | undefined>(props.prefill);
  const [touched, setTouched] = useState(false);

  const [subResponseCache, setSubResponseCache] = useState<Array<ResponseItem>>(
    (props.prefill && props.prefill.items) ? [...props.prefill.items] : []
  );

  useEffect(() => {
    if (touched) {
      const timer = setTimeout(() => {
        props.responseChanged(response);
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const getItemPrefill = (): ResponseItem | undefined => {
    if (!response || !response.items || response.items.length < 1) {
      return undefined;
    }
    return response.items[0];
  }

  const getPrefillForItem = (item: ItemComponent): ResponseItem | undefined => {
    if (!props.prefill || !props.prefill.items) { return undefined; }
    const itemPrefill = props.prefill.items.find(ri => ri.key === item.key);
    return itemPrefill;
  }

  const handleItemResponse = (key: string) => (response: ResponseItem | undefined) => {
    setTouched(true);
    setResponse(
      prev => {
        if (!prev || !prev.items) {
          return {
            key: props.compDef.key ? props.compDef.key : 'no key defined',
            items: response ? [response] : [],
          }
        }

        if (!response) {
          const newItems = prev.items?.filter(i => i.key !== key)
          if (!newItems || newItems.length < 1) {
            return undefined;
          }
          return {
            ...prev,
            items: newItems,
          }
        }

        const ind = prev.items.findIndex(item => item.key === response.key);
        if (ind > -1) {
          prev.items[ind] = { ...response };
        } else {
          prev.items.push({ ...response });
        }
        return {
          ...prev,
          items: [...prev.items],
        }
      });
  };

  const renderItems = (item: ItemComponent, isLast: boolean): React.ReactNode => {
    if (item.displayCondition === false) {
      return null;
    }
    const prefill = getItemPrefill();
    const optionKey = props.parentKey + '.' + item.key;

    const isDisabled = item.disabled === true;

    const optionClassName = getClassName(item.style);

    if (isItemGroupComponent(item)) {
      switch (item.role) {
        case 'text':
          return <div key={optionKey}>
            {renderFormattedContent(item, props.languageCode, undefined, props.dateLocales)}
          </div>
        case 'dropDownGroup':
          return <DropDownGroup
            key={optionKey}
            compDef={item}
            languageCode={props.languageCode}
            responseChanged={handleItemResponse(item.key ? item.key : 'undefined')}
            prefill={(prefill && prefill.key === item.key) ? prefill : undefined}
            fullWidth={true}
            parentKey={optionKey}
            defaultClassName={defaultInputClassName}
            dateLocales={props.dateLocales}
          />
      }
    } else {
      // Simplified option type (no styled text, single input)
      switch (item.role) {
        case 'text':
          return <TextViewComponent
            key={item.key}
            compDef={item}
            className={optionClassName}
            languageCode={props.languageCode}
          />
        case 'markdown':
          return <MarkdownComponent
            key={item.key}
            className={optionClassName}
            compDef={item}
            languageCode={props.languageCode}
          />;
        case 'input':
          return <TextInput
            parentKey={props.parentKey}
            key={item.key}
            compDef={item}
            prefill={(prefill && prefill.key === item.key) ? prefill : undefined}
            languageCode={props.languageCode}
            responseChanged={handleItemResponse(item.key ? item.key : 'undefined')}
            updateDelay={50}
            disabled={isDisabled}
            nonFullWidth={true}
            inputClassName='text-center'
            defaultClassName={defaultInputClassName}
            dateLocales={props.dateLocales}
          />;

        case 'lineBreak':
          return <div key={item.key} className="w-100" />
        case 'numberInput':
          return <NumberInput
            parentKey={props.parentKey}
            key={item.key}
            compDef={item}
            prefill={(prefill && prefill.key === item.key) ? prefill : undefined}
            languageCode={props.languageCode}
            responseChanged={handleItemResponse(item.key ? item.key : 'undefined')}
            ignoreClassName={optionClassName !== undefined}
            nonFullWidth={true}
            defaultClassName={defaultInputClassName}
            inputClassName='text-center'
            dateLocales={props.dateLocales}
          />;
        case 'dateInput':
          return <DateInput
            parentKey={optionKey}
            key={item.key}
            compDef={item}
            prefill={(prefill && prefill.key === item.key) ? prefill : undefined}
            languageCode={props.languageCode}
            responseChanged={handleItemResponse(item.key ? item.key : 'undefined')}
            openCalendar={undefined}
            disabled={isDisabled}
            defaultClassName={defaultInputClassName}
            dateLocales={props.dateLocales}
          />;
        case 'timeInput':
          return <Time
            parentKey={optionKey}
            key={item.key}
            compDef={item}
            prefill={(prefill && prefill.key === item.key) ? prefill : undefined}
            languageCode={props.languageCode}
            responseChanged={handleItemResponse(item.key ? item.key : 'undefined')}
            disabled={isDisabled}
            defaultClassName={defaultInputClassName}
            ignoreClassName={optionClassName !== undefined}
            nonFullWidth={true}
            dateLocales={props.dateLocales}
          />;
        default:
          return <p key={item.key}>role inside cloze question group not implemented yet: {item.role}</p>;
      }
    }
  }

  if (!(props.compDef as ItemGroupComponent).items) {
    return <p className="text-danger">ERROR: cloze question items array missing</p>
  }

  return (
    <div className="d-flex align-items-center flex-wrap">
      {
        (props.compDef as ItemGroupComponent).items.map(
          (option, index) => renderItems(option, (props.compDef as ItemGroupComponent).items.length - 1 === index)
        )
      }
    </div>
  );
};

export default ClozeQuestion;
