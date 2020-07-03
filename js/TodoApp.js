import TodoList from "./TodoList.js";
import TodoInput from "./TodoInput.js";
import TodoCount from "./TodoCount.js";
import { FILTER_MAP } from "../utils/constants.js";
import TodoFilter from "./TodoFilter.js";
import { loadTodos, saveTodos } from "../utils/localStorage.js";
import api from "../utils/api.js";
import UserList from "./UserList.js";
import UserTitle from "./UserTitle.js";

export default function TodoApp(params) {
  const {
    $targetTodoList,
    $targetTodoInput,
    $targetTodoCount,
    $targetTodoFilter,
    $targetUserList,
    $targetUserTitle,
  } = params;
  this.data = params.data || loadTodos();
  this.filter = FILTER_MAP.ALL;
  this.nextId = this.data.length + 1;
  this.userName = params.userName;
  this.users = params.users;

  const onToggle = async (id) => {
    await api.toggleTodo(this.userName, id);
    const nextData = await api.getTodos(this.userName);
    this.setState(nextData, this.filter);
  };

  const onRemove = async (id) => {
    await api.removeTodo(this.userName, id);
    const nextData = await api.getTodos(this.userName);
    this.setState(nextData, this.filter);
  };

  const onModify = async (id, nextContent) => {
    await api.modifyTodo(this.userName, id, nextContent);
    const nextData = await api.getTodos(this.userName);
    this.setState(nextData, this.filter);
  };

  const onSelect = async (id, priority) => {
    await api.changePriority(this.userName, id, priority);
    const nextData = await api.getTodos(this.userName);
    this.setState(nextData, this.filter);
  };

  const onKeyEnter = async (content) => {
    await api.postTodo(this.userName, content);
    const nextData = await api.getTodos(this.userName);
    this.setState(nextData, this.filter);
  };

  const onChangeFilter = (nextFilter) => {
    this.setState(this.data, nextFilter);
  };

  const filterTodos = (todos, filter) => {
    switch (filter) {
      case FILTER_MAP.ACTIVE:
        return todos.filter((todo) => !todo.isCompleted);
      case FILTER_MAP.COMPLETED:
        return todos.filter((todo) => todo.isCompleted);
      default:
        return todos;
    }
  };

  const changeUser = async (nextUserName) => {
    const nextData = await api.getTodos(nextUserName);
    this.setState(nextData, this.filter, nextUserName);
  };

  this.todoInput = new TodoInput({
    $target: $targetTodoInput,
    onKeyEnter,
  });

  this.todoList = new TodoList({
    $target: $targetTodoList,
    data: this.data,
    onToggle,
    onRemove,
    onModify,
    onSelect,
  });

  this.todoCount = new TodoCount({
    $target: $targetTodoCount,
    count: this.data.length,
  });

  this.todoFilter = new TodoFilter({
    $target: $targetTodoFilter,
    filter: this.filter,
    onChangeFilter,
  });

  this.userList = new UserList({
    $target: $targetUserList,
    users: this.users,
    userName: this.userName,
    changeUser,
  });

  this.userTitle = new UserTitle({
    $target: $targetUserTitle,
    userName: this.userName,
  });

  this.setState = (nextData, nextFilter, nextUserName = this.userName) => {
    this.data = nextData || [];
    this.filter = nextFilter;
    this.userName = nextUserName;

    const filteredTodos = filterTodos(this.data, this.filter) || [];

    this.userTitle.setState(this.userName);
    this.userList.setState(this.users, this.userName);
    this.todoList.setState(filteredTodos);
    this.todoCount.setState(filteredTodos.length);
    this.todoFilter.setState(this.filter);
    saveTodos(this.data);
    this.render();
  };

  this.render = () => {
    this.userTitle.render();
    this.userList.render();
    this.todoList.render();
    this.todoCount.render();
    this.todoFilter.render();
  };
}
