package com.zask.workspace.repository;

import com.zask.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Integer> {
    List<Workspace> findByOwnerId(int ownerId);
    List<Workspace> findByVisibility(String visibility);
    boolean existsByNameAndOwnerId(String name, int ownerId);
    long countByOwnerId(int ownerId);
}