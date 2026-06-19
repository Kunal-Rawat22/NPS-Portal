package com.pulse.survey.service;

import com.pulse.survey.dto.request.CreateCategoryRequest;
import com.pulse.survey.dto.response.CategoryDto;
import com.pulse.survey.entity.Category;
import com.pulse.survey.exception.BadRequestException;
import com.pulse.survey.exception.ResourceNotFoundException;
import com.pulse.survey.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAll() {
        return categoryRepository.findAll().stream().map(CategoryDto::from).toList();
    }

    @Transactional
    public CategoryDto create(CreateCategoryRequest req) {
        if (categoryRepository.existsByName(req.name())) {
            throw new BadRequestException("Category already exists: " + req.name());
        }
        return CategoryDto.from(categoryRepository.save(Category.builder().name(req.name()).description(req.description()).build()));
    }

    @Transactional
    public CategoryDto update(UUID id, CreateCategoryRequest req) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        cat.setName(req.name());
        cat.setDescription(req.description());
        return CategoryDto.from(categoryRepository.save(cat));
    }

    @Transactional
    public void delete(UUID id) {
        categoryRepository.deleteById(id);
    }
}
