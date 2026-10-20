package com.sho1kat.entity;

import com.sho1kat.embeddable.SocialLink;
import com.sho1kat.enums.CompanySize;
import com.sho1kat.enums.CompanyStatus;
import com.sho1kat.enums.CompanyType;
import com.sho1kat.enums.IndustryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "companies", indexes = {
        @Index(name = "idx_company_name", columnList = "name"),
        @Index(name = "idx_company_industry", columnList = "industryType"),
        @Index(name = "idx_company_status", columnList = "companyStatus")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;
    private String coverImageUrl;
    private String website;
    private Integer foundingYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanySize companySize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyType companyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IndustryType industryType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CompanyStatus companyStatus = CompanyStatus.PENDING_VERIFICATION;

    @Column(unique = true)
    private String registrationNumber;

    @Column(nullable = false, unique = true)
    private Long ownerId; // user-service id, no cross-service FK

    @ElementCollection
    @CollectionTable(name = "company_social_links",
            joinColumns = @JoinColumn(name = "company_id"))
    @Builder.Default
    private List<SocialLink> socialLinks = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CompanyLocation> locations = new ArrayList<>();

    private Instant verifiedAt;
    private Instant suspendedAt;
    private Instant deletedAt;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private Instant updatedAt;

    public void addLocation(CompanyLocation location) {
        locations.add(location);
        location.setCompany(this);
    }

    public void removeLocation(CompanyLocation location) {
        locations.remove(location);
        location.setCompany(null);
    }
}