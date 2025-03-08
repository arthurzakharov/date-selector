import { FC, MouseEvent, useEffect } from 'react';
import type { DropdownChoice, DropdownProps } from './dropdown.types';
import { useState, useRef, useMemo } from 'react';
import { cn } from '../../utils/functions';
import IconChevron from '../../icons/chevron/chevron.component';
import IconMagnifyingGlass from '../../icons/magnifying-glass/magnifying-glass.component';
import InputControl from '../input-control/input-control.component';
import useClickOutside from '../../hooks/useClickOutside';
import useUpdateEffect from '../../hooks/useUpdateEffect';
import css from './dropdown.module.css';

const Dropdown: FC<DropdownProps> = ({
  choices,
  choice = null,
  placeholder = 'Wählen Sie Ihre private Krankenversicherung...',
  noResult = 'Keine Versicherung gefunden.',
  isSearchHidden = false,
  isSuccessHighlighted = false,
  multiple = false,
  closeButton = 'Schließen',
  onChange,
  onOpen = () => {},
  onClose = () => {},
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedChoices, setSelectedChoices] = useState<DropdownChoice[]>([]);

  const borderRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelection = (newValue: string, newLabel: string) => {
    setSelectedChoices((prev) => {
      const exists = prev.some(({ value }) => value === newValue);
      return exists ? prev.filter(({ value }) => value !== newValue) : [...prev, { value: newValue, label: newLabel }];
    });
  };

  const onCloseButtonClick = (e: MouseEvent): void => {
    e.preventDefault();
    setIsOpen(false);
    onChange(selectedChoices);
  };

  const visibleChoices = useMemo(
    () => choices.filter(({ label }) => label.toLowerCase().includes(search.toLowerCase())),
    [search, choices],
  );

  useEffect(() => setSelectedChoices(Array.isArray(choice) ? choice : []), [choice]);

  useUpdateEffect(() => {
    if (!isOpen) return onClose();
    if (isOpen && inputRef.current && boxRef.current) {
      inputRef.current.focus();
      onOpen(boxRef.current.clientHeight, boxRef.current.clientWidth);
    }
  }, [isOpen]);

  useClickOutside(boxRef, () => {
    if (multiple) onChange(selectedChoices);
    setIsOpen(false);
  }, [borderRef]);

  return (
    <div className={css.Dropdown}>
      <div
        data-testid="dropdown-border"
        ref={borderRef}
        data-success={!!(choice && isSuccessHighlighted)}
        className={css.DropdownBorder}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span data-testid="dropdown-value" className={css.DropdownValue}>
          {selectedChoices.length > 0
            ? selectedChoices.map((selectedChoice) => selectedChoice.label).join(', ')
            : placeholder}
        </span>
        <div className={css.DropdownChevronWrap}>
          <IconChevron data-dropdown-open={isOpen} className={css.DropdownChevron} />
        </div>
      </div>
      {isOpen && (
        <div data-testid="dropdown-box" ref={boxRef} className={css.DropdownBox}>
          {!isSearchHidden && (
            <div data-testid="dropdown-search" className={css.DropdownSearch}>
              <input
                data-testid="dropdown-input"
                ref={inputRef}
                value={search}
                type="text"
                className={css.DropdownInput}
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconMagnifyingGlass className={css.DropdownGlass} />
            </div>
          )}
          <ul className={css.DropdownChoices}>
            {visibleChoices.length ? (
              visibleChoices.map(({ value, label }) => (
                <li
                  data-testid="dropdown-choice"
                  key={value}
                  className={css.DropdownChoice}
                  onClick={() => {
                    if (multiple) {
                      handleSelection(value, label);
                    } else {
                      setIsOpen(false);
                      onChange([{ value, label }]);
                    }
                  }}
                >
                  {multiple && (
                    <InputControl
                      shape="checkbox"
                      checked={selectedChoices.some((selectedChoice) => selectedChoice.value === value)}
                    />
                  )}
                  <span data-with-checkbox={multiple}>{label}</span>
                </li>
              ))
            ) : (
              <li className={cn(css.DropdownChoice, css.DropdownChoiceNoResult)}>{noResult}</li>
            )}
          </ul>
          {multiple && (
            <div data-testid="dropdown-close" className={css.DropdownClose}>
              <button
                data-testid="dropdown-close-button"
                className={css.DropdownCloseButton}
                onClick={onCloseButtonClick}
              >
                {closeButton}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
