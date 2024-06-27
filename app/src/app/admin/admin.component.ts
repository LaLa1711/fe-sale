import {Component, OnInit, ViewChild} from '@angular/core';
import {CourseService} from '../service/course.service';
import {CoursesDto} from '../dto/CoursesDto';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {NzPaginationComponent} from 'ng-zorro-antd/pagination';
import {AuthService} from '../auth/auth.service';
import {FormsModule} from "@angular/forms";
import {NzModalComponent} from "ng-zorro-antd/modal";
import {NzTableComponent} from "ng-zorro-antd/table";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NzModalComponent,
    NzPaginationComponent,
    NzTableComponent,
    CommonModule,
  ],
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  courses: CoursesDto[] = [];
  selectedFile: File | null = null;
  description: string = '';
  name: string = '';
  isEditing = false;
  id: number | null = null;
  images: { [key: number]: SafeUrl } = {};

  dataSource: CoursesDto[] = [];
  total: number = 0;
  pageIndex = 1;
  pageSize = 5;
  totalPages: number = 0;
  pages: number[] = [];


  isVisible = false;
  dialogTitle = 'Add Course';
  @ViewChild(NzPaginationComponent, {static: true}) paginator: NzPaginationComponent | undefined;


  constructor(private courseService: CourseService, private sanitizer: DomSanitizer, private authService: AuthService) {
  }

  ngOnInit(): void {
    // this.fetchCourses();
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

  resetForm(): void {
    this.selectedFile = null;
    this.description = '';
    this.name = '';
    this.isEditing = false;
    this.id = null;
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

  createCourse(): void {
    if (this.selectedFile === null) {
      console.error('No file selected');
      return;
    }

    this.courseService.createCourse(this.selectedFile, this.description, this.name).subscribe(
      (response) => {
        console.log('Course created successfully:', response);
        this.fetchCoursesPaging(this.pageIndex, this.pageSize);
        this.resetForm();
        this.isVisible = false;
      },
      (error) => {
        console.error('Failed to create course:', error);
      }
    );
  }

  openAddEditDialog(mode: 'Add' | 'Edit', course?: CoursesDto): void {
    this.isVisible = true;
    this.dialogTitle = `${mode === 'Add' ? 'Add' : 'Edit'} Course`;
    if (mode === 'Edit' && course) {
      this.id = course.id;
      this.name = course.name;
      this.description = course.description;
      this.isEditing = true;
    } else {
      this.resetForm();
      this.isEditing = false;
    }
  }

  updateCourse(): void {
    if (this.id === null || this.id === undefined) {
      console.error('Course ID is not set');
      return;
    }

    const formData = new FormData();
    formData.append('id', this.id.toString());
    formData.append('name', this.name);
    formData.append('description', this.description);
    if (this.selectedFile !== null) {
      formData.append('file', this.selectedFile);
    }

    this.courseService.updateCourse(this.id, this.selectedFile, this.description, this.name).subscribe(
      (response) => {
        console.log('Course updated successfully:', response);
        this.fetchCoursesPaging(this.pageIndex, this.pageSize);
        this.resetForm();
        this.isVisible = false;
        alert('ok');
      },
      (error) => {
        console.error('Failed to update course:', error);
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
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

  onPageChange(pageIndex: number): void {
    if (this.paginator) {
      const pageSize = this.paginator.nzPageSize;
      this.fetchCoursesPaging(pageIndex, pageSize);
    } else {
      console.error('Paginator is not defined');
    }
  }


  openAddDialog(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  onSubmit(): void {
    const formData = new FormData();
    // @ts-ignore
    formData.append('id', this.id);
    formData.append('name', this.name);
    formData.append('description', this.description);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditing) {
      this.updateCourse();
    } else {
      this.createCourse();
    }
  }

  deleteCourse(id: number): void {
    this.courseService.deleteCourse(id).subscribe(
      () => {
        console.log(`Course with ID ${id} deleted successfully.`);
        // Optionally, refresh your course list or update UI after deletion
        this.fetchCoursesPaging(1, this.pageSize);
        alert('Successfully deleted!');
      },
      (error) => {
        console.error(`Failed to delete course with ID ${id}:`, error);
        // Handle error cases as needed
      }
    );
  }


  logout(): void {
    this.authService.logout();
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
}
