import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  name = '';
  email = '';
  password = '';

  title = 'AAST TODOs';
  inputText = '';
  inputDescription = '';

  isLoading = false;

  constructor(private http: HttpClient) {}
  private modalService = inject(NgbModal);

  todos: any = [];
  loggedInUser: any = null;
  isSignUp = false;

  invalidLogin = false;

  ngOnInit() {
    this.loggedInUser = localStorage.getItem('user.aast');

    console.log('this.loggedInUser: ', this.loggedInUser);
    if (this.loggedInUser) this.loggedInUser = JSON.parse(this.loggedInUser);
    else return;
    this.getTodos();
    console.log('ngOnInit called');
  }

  getTodos() {
    this.isLoading = true;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('token', localStorage.getItem('token.aast') || '');

    this.http
      .get('http://localhost:3000/todos', { headers })
      .subscribe((todos) => {
        this.todos = todos;
        this.isLoading = false;
      });
  }

  registerUser() {
    this.isLoading = true;
    this.http
      .post('http://localhost:3000/register', {
        name: this.name,
        email: this.email,
        password: this.password,
      })
      .subscribe((response: any) => {
        this.loggedInUser = response.user;
        this.isLoading = false;
        localStorage.setItem('user.aast', JSON.stringify(response.user));
        localStorage.setItem('token.aast', response.token);
        this.getTodos();
      });
  }

  loginUser() {
    this.isLoading = true;
    this.http
      .post('http://localhost:3000/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe(
        (response: any) => {
          this.loggedInUser = response.user;
          this.isLoading = false;
          localStorage.setItem('user.aast', JSON.stringify(response.user));
          localStorage.setItem('token.aast', response.token);
          this.getTodos();
        },
        (error) => {
          this.isLoading = false;
          console.log('error : ', error);
          if (error.status === 404) this.invalidLogin = true;
        }
      );
  }

  addTodo() {
    this.isLoading = true;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('token', localStorage.getItem('token.aast') || '');

    this.http
      .post(
        'http://localhost:3000/todos',
        {
          text: this.inputText,
          description: this.inputDescription,
        },
        { headers }
      )
      .subscribe((todo) => {
        this.todos.push(todo);
        this.isLoading = false;
        this.inputText = '';
        this.inputDescription = '';
        this.modalService.dismissAll();
      });

    console.log(this.todos);
  }

  removeTodo(todo: any) {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('token', localStorage.getItem('token.aast') || '');

    this.isLoading = true;
    this.http
      .delete('http://localhost:3000/todos/' + todo._id, { headers })
      .subscribe(() => {
        this.isLoading = false;
        this.todos = this.todos.filter((item: any) => item._id !== todo._id);
      });
  }

  openVerticallyCentered(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true });
  }
}
