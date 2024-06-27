import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CoursesDto} from '../dto/CoursesDto';
import {catchError} from 'rxjs/operators';
import { RegisterCoursesDto } from '../dto/RegisterCoursesDto';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = 'http://localhost:6969/courses';
  private apiUrl2 = 'http://localhost:6969/register-courses'; 

  constructor(private http: HttpClient) {
  }

  getCourses(): Observable<any> {
    return this.http.get<CoursesDto[]>(`${this.apiUrl}/listCourses`);
  }

  getFile(filename: string): Observable<Blob> {
    const url = `${this.apiUrl}/files/${filename}`;
    return this.http.get(url, {responseType: 'blob'});
  }

  // API /create - Thêm mới khóa học
  createCourse(file: File, description: string, name: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('name', name);

    return this.http.post<any>(`${this.apiUrl}/create`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // API /update - Cập nhật khóa học
  updateCourse(id: number, file: File | null, description: string, name: string): Observable<any> {
    const formData: FormData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('description', description);
    formData.append('name', name);
    formData.append('id', id.toString());

    return this.http.put<any>(`${this.apiUrl}/update`, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi
  private handleError(error: any): Observable<any> {
    console.error('An error occurred:', error);
    throw error;
  }

  // Lấy danh sách khóa học phân trang từ backend
  getCoursesPaging(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<CoursesDto[]>(`${this.apiUrl}/paging`, {params});
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError) // Handle errors
    );
  }

  createRegisterCourses(registerCoursesDto: RegisterCoursesDto): Observable<RegisterCoursesDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<RegisterCoursesDto>(`${this.apiUrl2}/create`, registerCoursesDto, { headers });
  }
}
