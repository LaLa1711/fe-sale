import {Component, OnInit, ViewChild} from '@angular/core';
import {CourseService} from '../service/course.service';
import {CoursesDto} from '../dto/CoursesDto';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NzPaginationComponent} from 'ng-zorro-antd/pagination';
import {NzTableComponent} from "ng-zorro-antd/table";
import {CommonModule} from "@angular/common";
import { RegisterCoursesDto } from '../dto/RegisterCoursesDto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    NzPaginationComponent,
    NzTableComponent,
    CommonModule,
    FormsModule
  ],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  name: string = '';
  images: { [key: number]: SafeUrl } = {};
  dataSource: CoursesDto[] = [];
  total: number = 0;
  pageIndex = 1;
  pageSize = 4;
  totalPages: number = 0;
  pages: number[] = [];

  courses: CoursesDto[] = [];
  registerCoursesDto: RegisterCoursesDto = {
    name: '',
    id: 0,
    email: '',
    phone: '',
    clan: '',
    courses: ''
  };
  isVisible = false;
  dialogTitle = 'Register Course';

  @ViewChild(NzPaginationComponent, {static: true}) paginator!: NzPaginationComponent;

  constructor(private courseService: CourseService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.fetchCoursesPaging(this.pageIndex, this.pageSize);
  }


  fetchCoursesPaging(page: number, size: number): void {
    this.courseService.getCoursesPaging(page - 1, size).subscribe(
      (data: any) => {
        this.dataSource = data.content;
        this.total = data.totalElements;
        this.totalPages = Math.ceil(this.total / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.loadImages2(data.content); // Load images for each course
      },
      (error) => {
        console.error('Failed to fetch courses:', error);
      }
    );
  }

  loadImages2(courses: CoursesDto[]): void {
    courses.forEach(course => {
      const filename = course.image.split('/').pop();
      // @ts-ignore
      this.courseService.getFile(filename).subscribe(blob => {
        const url = URL.createObjectURL(blob);
        this.images[course.id] = this.sanitizer.bypassSecurityTrustUrl(url);
      }, error => {
        console.error('Error loading image:', error);
      });
    });
  }

  prevPage(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.fetchCoursesPaging(this.pageIndex, this.pageSize);
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.fetchCoursesPaging(this.pageIndex, this.pageSize);
    }
  }

  goToPage(page: number): void {
    this.pageIndex = page;
    this.fetchCoursesPaging(this.pageIndex, this.pageSize);
  }

  fetchCourses(): void {
    this.courseService.getCourses().subscribe(
      (data) => {
        this.courses = data;
        // Load images for each course
        this.courses = data;
        this.loadImages();
      },
      (error) => {
        console.error('Failed to fetch courses:', error);
      }
    );
  }

  loadImages(): void {
    this.courses.forEach(course => {
      const imageUrl = course.image ?? ''; // Sử dụng Nullish Coalescing để đảm bảo imageUrl không phải là undefined
      const filename = imageUrl.split('/').pop() ?? ''; // Sử dụng Nullish Coalescing để đảm bảo filename không phải là undefined

      if (filename) {
        this.courseService.getFile(filename).subscribe(blob => {
          const url = URL.createObjectURL(blob);
          this.images[course.id] = this.sanitizer.bypassSecurityTrustUrl(url);
        }, error => {
          console.error('Error loading image:', error);
        });
      } else {
        console.error('Filename is empty for course:', course);
      }
    });
  }

  openDialog(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  onSubmit(): void {
    this.courseService.createRegisterCourses(this.registerCoursesDto).subscribe(
      (response) => {
        console.log('Course registered successfully:', response);
        this.isVisible = false;  // Đóng modal sau khi đăng ký thành công
        alert('Successfully!');
      },
      (error) => {
        console.error('Error registering course:', error);
      }
    );
  }
}
