package com.vatsan.jps_backend;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Document(collection = "recruiters")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Recruiter {
    @Id
    private ObjectId id;
    private String name;
    private String email;
    private String password;
    private List<ObjectId> jobIds;

    public Recruiter(String name, String email, String password, List<ObjectId> jobIds) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.company = company;
        this.location = location;
        this.jobIds = (jobIds != null) ? jobIds : new ArrayList<>();
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @JsonProperty("id")
    public String getIdString() {
        return id != null ? id.toHexString() : null;
    }

    @JsonProperty("jobIds")
    public List<String> getJobIdsString() {
        if (jobIds != null) {
            return jobIds.stream().map(ObjectId::toHexString).collect(Collectors.toList());
        } else {
            return null;
        }
    }

    public void addJobId(ObjectId jobId) {
        if (this.jobIds == null) {
            this.jobIds = new ArrayList<>();
        }
        this.jobIds.add(jobId);
    }

    public void removeJobId(ObjectId jobId) {
        this.jobIds.remove(jobId);
    }
}
