---
title: "policr"
date: 2017-11-10T17:15:04+01:00
draft: true
---

 # Vision
 Achieving Continuous Compliance for Cloud Infrastructure Code development


## Rationale

 To truly achieve DevOps, meaning Sysops with Development practices, the Red-Green-Refactor cycle must be adopted.
 For this to be achieved, test must be written before the creation of infrastructure provisioning code.

 When starting to develop infrastructure code, being terraform or cloudformation for example, one cannot test the code
 against company polices regarding the Cloud, such as for example:

 * All buckets must be private
 * The resources must use KMS for data encryption
 * The resource must contain tags with Cost Center and Owner
 * Policy must be assigned to roles and not directly to users


## Features

 > Platform Agnostic - aims to support the main cloud providers

 > Easy Integration - easy integrated into Developer Workflow running locally

 > Open and Extensible - developers should be able to extend importers and tests

 > Test locally or remote - able to run locally on laptop or centrally over all cloud accounts

 > Pre and Post Provisioning - able to test the compliance before and after provisioning