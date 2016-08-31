<?php
/**
 * JobCommentView
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * JobCommentView
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity
 * @ORM\Table(name="Job_Comment_Views")
 */
class JobCommentView
{
    /**
     * @var int
     *
     * @ORM\Id
     * @ORM\Column(name="Job_Comment_View_ID", type="integer")
     */
    protected $id;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Creation_Timestamp", type="timestamp")
     */
    protected $created;

    /**
     * @var JobComment
     *
     * @ORM\ManyToOne(targetEntity="JobComment", inversedBy="views")
     * @ORM\JoinColumn(name="Job_Comment_ID", referencedColumnName="Job_Comment_ID")
     */
    protected $jobComment;

    /**
     * @var User
     *
     * @ORM\ManyToOne(targetEntity="User", inversedBy="jobCommentViews")
     * @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     */
    protected $user;

    public function getId()
    {
        return $this->id;
    }

    public function getCreated()
    {
        return $this->created;
    }

    public function getJobComment()
    {
        return $this->jobComment;
    }

    public function setJobComment(JobComment $jobComment)
    {
        $this->jobComment = $jobComment;
        return $this;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
        return $this;
    }
}
