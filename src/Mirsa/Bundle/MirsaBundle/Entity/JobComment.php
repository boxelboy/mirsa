<?php
/**
 * JobComment
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer;

/**
 * Job comment entity
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Job_Comments")
 *
 * @Serializer\XmlRoot("jobcomment")
 * @Serializer\ExclusionPolicy("all")
 */
class JobComment
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Job_Comment_ID", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Comment_Text", type="string")
     * @Serializer\Expose
     * @Assert\NotBlank
     */
    protected $comment;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     */
    protected $created;

    /**
     * @var Job
     *
     * @ORM\ManyToOne(targetEntity="BusinessMan\Bundle\JobBundle\Entity\Job", inversedBy="comments")
     * @ORM\JoinColumn(name="Job_Number", referencedColumnName="Job_Number")
     */
    protected $job;

    /**
     * @var Contact
     *
     * @ORM\ManyToOne(targetEntity="Contact")
     * @ORM\JoinColumn(name="Client_Contact_ID", referencedColumnName="Record_ID")
     */
    protected $contact;

    /**
     * @var Staff
     *
     * @ORM\ManyToOne(targetEntity="Staff")
     * @ORM\JoinColumn(name="Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    /**
     * @ORM\OneToMany(targetEntity="JobCommentView", mappedBy="jobComment")
     */
    protected $views;

    public function getId()
    {
        return $this->id;
    }

    public function getComment()
    {
        return $this->comment;
    }

    public function setComment($comment)
    {
        $this->comment = $comment;
        return $comment;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getJob()
    {
        return $this->job;
    }

    public function setJob(Job $job)
    {
        $this->job = $job;
        return $this;
    }

    public function getContact()
    {
        return $this->contact;
    }

    public function setContact(Contact $contact)
    {
        $this->contact = $contact;
        return $this;
    }

    public function getStaff()
    {
        return $this->staff;
    }

    public function setStaff(Staff $staff)
    {
        $this->staff = $staff;
        return $this;
    }

    public function getViews()
    {
        return $this->views;
    }

    public function getViewedByUser(User $user)
    {
        foreach ($this->getViews() as $view) {
            if ($view->getUser()->getId() === $user->getId()) {
                return $view;
            }
        }

        return false;
    }
}
