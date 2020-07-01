import { validator } from "../utils/validator.js";
import { todoListTemplate } from "../utils/templates.js";
import { classNameMap, keyMap } from "../utils/constants.js";

const validateTodoList = (context, params) => {
  validator.isNewInstance(context, TodoList);
  validator.isObject(params);

  const { $target, data, onToggle, onRemove, onModify } = params;

  validator.isElement($target);
  validator.isArray(data);
  validator.isFunction(onToggle);
  validator.isFunction(onRemove);
  validator.isFunction(onModify);

  data.forEach((todo) => {
    validator.isString(todo.contents);
    validator.isNotZeroLengthString(todo.contents);
    validator.isBoolean(todo.isCompleted);
  });
};

export default function TodoList(params) {
  validateTodoList(this, params);

  const { $target } = params;
  this.data = params.data;
  this.onToggle = params.onToggle;
  this.onRemove = params.onRemove;
  this.onModify = params.onModify;
  this.onSelect = params.onSelect;

  this.onFocus = ($edit) => $edit.classList.toggle(classNameMap.FOCUS);
  this.onKeyDown = (e) => {
    const $edit = e.target.closest("li");
    const { id } = e.target.closest("li").dataset;

    switch (e.key) {
      case keyMap.ESC:
        {
          const index = this.data.findIndex((todo) => todo._id === id);
          e.target.value = this.data[index].content;
          this.onFocus($edit);
        }
        break;
      case keyMap.ENTER:
        {
          const content = e.target.value;
          this.onModify(id, content);
        }
        break;
    }
  };

  this.controlPriority = (id, priority) => {
    if (priority !== 0) {
      this.onSelect(id, priority);
    }
  };

  this.onClick = (e) => {
    const { id } = e.target.closest("li").dataset;

    if (e.target.classList.contains(classNameMap.TOGGLE)) {
      this.onToggle(id);
    } else if (e.target.classList.contains(classNameMap.REMOVE)) {
      this.onRemove(id);
    } else if (e.target.classList.contains(classNameMap.SELECT)) {
      this.controlPriority(id, Number(e.target.value));
    }
  };

  $target.addEventListener("click", (e) => {
    this.onClick(e);
  });

  $target.addEventListener("dblclick", ({ target }) => {
    if (target.classList.contains(classNameMap.LABEL)) {
      const $edit = target.closest("li");
      this.onFocus($edit);
    }
  });

  $target.addEventListener("keydown", (e) => {
    if (!e.target.classList.contains(classNameMap.ON_EDIT)) {
      return;
    }

    this.onKeyDown(e);
  });

  this.setState = (nextData) => {
    this.data = nextData;
    this.render();
  };

  this.render = () => {
    $target.innerHTML = todoListTemplate(this.data);
  };

  this.render();
}
