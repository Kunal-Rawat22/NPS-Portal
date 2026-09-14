package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateCategoryRequest;
import com.pulse.survey.dto.response.CategoryDto;
import com.pulse.survey.entity.Category;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void getAll_returnsCategoryDtos() {
        Category category = Category.builder()
                .id(UUID.randomUUID())
                .name("Engagement")
                .description("Employee engagement")
                .build();
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryDto> result = categoryService.getAll();

        assertThat(result, hasSize(1));
        assertThat(result.get(0).name(), equalTo("Engagement"));
        assertThat(result.get(0).description(), equalTo("Employee engagement"));
    }

    @Test
    void create_savesAndReturnsDto() {
        CreateCategoryRequest request = new CreateCategoryRequest("Engagement", "Employee engagement");
        when(categoryRepository.existsByName("Engagement")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(UUID.randomUUID());
            return category;
        });

        CategoryDto result = categoryService.create(request);

        assertThat(result.name(), equalTo("Engagement"));
        assertThat(result.description(), equalTo("Employee engagement"));
        assertThat(result.id(), notNullValue());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void create_throwsWhenNameExists() {
        CreateCategoryRequest request = new CreateCategoryRequest("Engagement", "Employee engagement");
        when(categoryRepository.existsByName("Engagement")).thenReturn(true);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> categoryService.create(request)
        );

        assertThat(ex.getMessage(), containsString("Category already exists"));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void update_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        CreateCategoryRequest request = new CreateCategoryRequest("Engagement", "Updated description");
        when(categoryRepository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.update(id, request)
        );

        assertThat(ex.getMessage(), containsString("Category not found"));
        verify(categoryRepository, never()).save(any(Category.class));
    }
}
